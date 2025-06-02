/**
 * Heurística constructiva con aleatoriedad para el IHTP,
 * asegurándose de que todos los pacientes aparecen en solution.patients.
 *
 * Supone que `inputData` es un objeto con la misma estructura JSON descrita en el PDF:
 * {
 *   days: número de días (D),
 *   shift_types: ["early","late","night"],
 *   nurses: [ {id, skill_level, working_shifts: [ {day, shift, max_load}, ... ] }, ... ],
 *   rooms: [ {id, capacity}, ... ],
 *   operating_theaters: [ {id, availability: [minutos_por_día...]}, ... ],
 *   surgeons: [ {id, max_surgery_time: [minutos_por_día...]}, ... ],
 *   occupants: [ {id, room_id, length_of_stay, gender, ...}, ... ],
 *   patients: [ 
 *     { id, mandatory, surgery_release_day, surgery_due_day, length_of_stay, surgery_duration,
 *       surgeon_id, incompatible_room_ids, gender, workload_produced, skill_level_required, ... },
 *       ...
 *   ]
 * }
 *
 * La función devuelve un objeto `solution`:
 * {
 *   patients: [
 *     { id, admission_day, room?, operating_theater? },
 *     ...
 *   ],
 *   nurses: [
 *     { id, assignments: [ {day, shift, rooms:[...]}, ... ] },
 *     ...
 *   ]
 * }
 *
 * Nota clave: todos los pacientes de inputData.patients aparecen en solution.patients.
 * Si un paciente opcional no cabe en ningún hueco, se añade con admission_day: "none".
 */

// -------------------------------------------------------------
// UTILIDADES GENERALES
// -------------------------------------------------------------
function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[i - 1]] = [a[i - 1], a[i]];
    }
    return a;
}

function buildIdToIndexMap(array) {
    const map = {};
    array.forEach((el, idx) => {
        map[el.id] = idx;
    });
    return map;
}

// -------------------------------------------------------------
// ESTRUCTURAS DE DISPONIBILIDAD
// -------------------------------------------------------------
function initRoomOccupancy(rooms, days) {
    const R = rooms.length;
    return Array.from({ length: R }, () => Array(days).fill(0));
}

function initOTUsage(operatingTheaters, days) {
    const T = operatingTheaters.length;
    return Array.from({ length: T }, () => Array(days).fill(0));
}

function initNurseLoad(nurses, days) {
    const N = nurses.length;
    const loads = Array(N);
    for (let i = 0; i < N; i++) {
        loads[i] = new Map();
        for (const ws of nurses[i].working_shifts) {
            const key = `${ws.day}-${ws.shift}`;
            loads[i].set(key, 0);
        }
    }
    return loads;
}

// -------------------------------------------------------------
// FUNCIÓN PRINCIPAL: HEURÍSTICA CONSTRUCTIVA
// -------------------------------------------------------------
function constructiveHeuristic(inputData) {
    const D = inputData.days;
    const rooms = inputData.rooms;                          // [ {id, capacity}, ... ]
    const operatingTheaters = inputData.operating_theaters; // [ {id, availability:[...]}, ... ]
    const nurses = inputData.nurses;                        // [ {id, skill_level, working_shifts:[...]}, ... ]
    const surgeons = inputData.surgeons;                    // [ {id, max_surgery_time:[...]}, ... ]
    const occupants = inputData.occupants;                  // [ {id, room_id, length_of_stay, gender, ...}, ... ]
    const patients = inputData.patients;                    // [ {id, mandatory, ..., gender, ...}, ... ]

    // Mapas de id → índice en array
    const roomIndex = buildIdToIndexMap(rooms);
    const otIndex = buildIdToIndexMap(operatingTheaters);
    const nurseIndex = buildIdToIndexMap(nurses);
    const surgeonIndex = buildIdToIndexMap(surgeons);

    // Inicializar estructuras de disponibilidad
    const roomOcc = initRoomOccupancy(rooms, D);       // roomOcc[rIdx][day]: número de camas ocupadas
    const otUsage = initOTUsage(operatingTheaters, D); // otUsage[tIdx][day]: minutos usados
    const nurseLoads = initNurseLoad(nurses, D);       // nurseLoads[nIdx]: Map("day-shift" → carga actual)

    // 1) Colocar a los occupants fijos (pacientes ya ingresados)
    for (const occ of occupants) {
        const rIdx = roomIndex[occ.room_id];
        const length = occ.length_of_stay;
        for (let d = 0; d < length && d < D; d++) {
            roomOcc[rIdx][d] += 1;
        }
    }

    // 2) Preparar objeto solución inicial
    const solution = {
        patients: [],   // aquí guardaremos {id, admission_day, room?, operating_theater?}
        nurses: nurses.map(n => ({
            id: n.id,
            assignments: [] // cada entry: { day, shift, rooms: [roomId,...] }
        }))
    };

    // Auxiliar para asignar enfermera a sala en (day,shift)
    function assignNurseToRoom(nurseIdx, day, shift, roomId) {
        const key = `${day}-${shift}`;
        const prevLoad = nurseLoads[nurseIdx].get(key) || 0;
        nurseLoads[nurseIdx].set(key, prevLoad + 1);

        // Añadir la sala en solution.nurses[nurseIdx].assignments
        let found = false;
        for (const assign of solution.nurses[nurseIdx].assignments) {
            if (assign.day === day && assign.shift === shift) {
                assign.rooms.push(roomId);
                found = true;
                break;
            }
        }
        if (!found) {
            solution.nurses[nurseIdx].assignments.push({
                day: day,
                shift: shift,
                rooms: [roomId]
            });
        }
    }

    const shiftsPerDay = inputData.shift_types; // e.g. ["early","late","night"]

    // 3) Empezar con la heurística por pacientes
    //    Barajamos el orden para introducir aleatoriedad
    const patientOrder = shuffleArray(patients);

    for (const p of patientOrder) {
        const pid = p.id;
        const mandatory = p.mandatory === true;
        const relDay = p.surgery_release_day;
        const dueDay = mandatory ? p.surgery_due_day : (D - 1);
        const lengthStay = p.length_of_stay;
        const surgeryDur = p.surgery_duration;
        const incompatibleRoomsSet = new Set(p.incompatible_room_ids || []);
        const gender = p.gender;

        let assigned = false;

        // Generar lista de días factibles [relDay..dueDay] y barajar
        const feasibleDays = [];
        for (let d = relDay; d <= dueDay && d < D; d++) {
            feasibleDays.push(d);
        }
        const daysShuffled = shuffleArray(feasibleDays);

        // Intentar asignar en alguno de esos días
        for (const day0 of daysShuffled) {
            // 3.1) Verificar qué quirófanos (OTs) tienen hueco para esta cirugía en day0
            const otsDisponibles = [];
            for (let t = 0; t < operatingTheaters.length; t++) {
                const capDia = operatingTheaters[t].availability[day0];
                if (capDia - otUsage[t][day0] >= surgeryDur) {
                    otsDisponibles.push(t);
                }
            }
            if (otsDisponibles.length === 0) {
                continue; // ningún OT libre este día
            }
            // Barajar y elegir una OT al azar
            const chosenOtIdx = shuffleArray(otsDisponibles)[0];

            // 3.2) Verificar salas compatibles que cumplan capacidad y no mezclen géneros
            const candidateRooms = [];
            for (let r = 0; r < rooms.length; r++) {
                const roomId = rooms[r].id;
                if (incompatibleRoomsSet.has(roomId)) continue;

                let okRoom = true;
                for (let dd = day0; dd < day0 + lengthStay && dd < D; dd++) {
                    // Capacidad
                    if (roomOcc[r][dd] + 1 > rooms[r].capacity) {
                        okRoom = false;
                        break;
                    }
                    // Sin mezcla de géneros (revisar otros pacientes asignados)
                    for (const solP of solution.patients) {
                        if (solP.room === roomId) {
                            const adm = solP.admission_day;
                            // Si admission_day no es "none", comprobamos su estancia real
                            if (typeof adm === 'number') {
                                const len = patients.find(q => q.id === solP.id).length_of_stay;
                                if (dd >= adm && dd < adm + len) {
                                    const otherGender = patients.find(q => q.id === solP.id).gender;
                                    if (otherGender !== gender) {
                                        okRoom = false;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (!okRoom) break;
                }
                if (okRoom) {
                    candidateRooms.push(r);
                }
            }
            if (candidateRooms.length === 0) {
                continue; // ninguna sala libre este día
            }
            // Barajar y elegir una sala al azar
            const chosenRoomIdx = shuffleArray(candidateRooms)[0];
            const chosenRoomId = rooms[chosenRoomIdx].id;

            // 3.3) Ya podemos asignar al paciente en day0, chosenRoomIdx y chosenOtIdx
            //      Actualizar ocupaciones:
            for (let dd = day0; dd < day0 + lengthStay && dd < D; dd++) {
                roomOcc[chosenRoomIdx][dd] += 1;
            }
            otUsage[chosenOtIdx][day0] += surgeryDur;

            // Registrar en la solución:
            solution.patients.push({
                id: pid,
                admission_day: day0,
                room: chosenRoomId,
                operating_theater: operatingTheaters[chosenOtIdx].id
            });

            assigned = true;
            break; // romper el bucle de días factibles
        }

        // 3.4) Si no se asignó en ningún día factible:
        if (!assigned) {
            if (mandatory) {
                //  — Es obligatorio: forzamos en su último día possible (dueDay)
                const day0 = dueDay < D ? dueDay : D - 1;
                // Escoger cualquier OT (aunque viole capacidad):
                const anyOts = Array.from({ length: operatingTheaters.length }, (_, i) => i);
                const chosenOtIdx = shuffleArray(anyOts)[0];
                // Escoger cualquier sala compatible (sin chequear capacidad):
                const candidateRooms = [];
                for (let r = 0; r < rooms.length; r++) {
                    if (!incompatibleRoomsSet.has(rooms[r].id)) {
                        candidateRooms.push(r);
                    }
                }
                const chosenRoomIdx = shuffleArray(candidateRooms)[0];
                const chosenRoomId = rooms[chosenRoomIdx].id;

                // Actualizar (aunque sobrepase)
                for (let dd = day0; dd < day0 + lengthStay && dd < D; dd++) {
                    roomOcc[chosenRoomIdx][dd] += 1;
                }
                otUsage[chosenOtIdx][day0] += surgeryDur;

                solution.patients.push({
                    id: pid,
                    admission_day: day0,
                    room: chosenRoomId,
                    operating_theater: operatingTheaters[chosenOtIdx].id
                });
                assigned = true;
            } else {
                // — Es opcional: no se programa. Lo marcamos con admission_day: "none"
                solution.patients.push({
                    id: pid,
                    admission_day: "none"
                });
            }
        }
    } // fin bucle pacientes

    // 4) ASIGNACIÓN DE ENFERMERAS POR TURNO Y SALA
    for (let day = 0; day < D; day++) {
        for (const shift of shiftsPerDay) {
            // 4.1) Detectar salas ocupadas en (day, shift)
            const salasOcupadas = new Set();
            for (const solP of solution.patients) {
                const adm = solP.admission_day;
                if (typeof adm === 'number') {
                    const pInfo = patients.find(q => q.id === solP.id);
                    const len = pInfo.length_of_stay;
                    if (day >= adm && day < adm + len) {
                        salasOcupadas.add(solP.room);
                    }
                }
            }
            if (salasOcupadas.size === 0) continue;

            // 4.2) Para cada sala ocupada, asignar enfermera
            for (const roomId of salasOcupadas) {
                const enfermerasDisponibles = [];
                for (let ni = 0; ni < nurses.length; ni++) {
                    //  — Ver si la enfermera trabaja en (day, shift)
                    const trabajaAquí = nurses[ni].working_shifts.some(ws => ws.day === day && ws.shift === shift);
                    if (!trabajaAquí) continue;
                    //  — Ver carga actual y carga máxima
                    const key = `${day}-${shift}`;
                    const cargaActual = nurseLoads[ni].get(key) || 0;
                    const maxLoad = nurses[ni].working_shifts.find(ws => ws.day === day && ws.shift === shift).max_load;
                    if (cargaActual + 1 <= maxLoad) {
                        enfermerasDisponibles.push(ni);
                    }
                }

                let nurseAssignedIdx = -1;
                if (enfermerasDisponibles.length > 0) {
                    nurseAssignedIdx = shuffleArray(enfermerasDisponibles)[0];
                } else {
                    // No cabe ninguna sin exceder carga → asignamos cualquiera que trabaje (aunque exceda)
                    const anyDisponibles = [];
                    for (let ni = 0; ni < nurses.length; ni++) {
                        const trabajaAquí = nurses[ni].working_shifts.some(ws => ws.day === day && ws.shift === shift);
                        if (trabajaAquí) {
                            anyDisponibles.push(ni);
                        }
                    }
                    if (anyDisponibles.length > 0) {
                        nurseAssignedIdx = shuffleArray(anyDisponibles)[0];
                    }
                }

                if (nurseAssignedIdx >= 0) {
                    assignNurseToRoom(nurseAssignedIdx, day, shift, roomId);
                }
            }
        }
    }

    return solution;
}

// Si usas CommonJS, exporta así:
module.exports = { constructiveHeuristic };
