const _ = require('lodash'); // para sample, shuffle

function inicializarSolution(D, rooms, operating_theaters, surgeons) {
    // patientAssigns: map paciente → { day, room, operatingTheater }, vacío al inicio
    const patientAssigns = new Map();

    // roomOccupancy[d] = Map  de roomId → [ pacienteIds  ] (ocupantes ese día)
    const roomOccupancy = Array.from({ length: D }, () => new Map());
    for (let d = 0; d < D; d++) {
        for (const r of rooms) {
            roomOccupancy[d].set(r.id, []);
        }
    }

    // OTUsage[d] = Map de OTid → minutosTotalesAsignados ese día
    const OTUsage = Array.from({ length: D }, () => new Map());
    for (let d = 0; d < D; d++) {
        for (const ot of operating_theaters) {
            OTUsage[d].set(ot.id, 0);
        }
    }

    // surgeonUsage[d] = Map de surgeonId → minutosTotalesAsignados ese día
    const surgeonUsage = Array.from({ length: D }, () => new Map());
    for (let d = 0; d < D; d++) {
        for (const s of surgeons) {
            surgeonUsage[d].set(s.id, 0);
        }
    }

    return { patientAssigns, roomOccupancy, OTUsage, surgeonUsage };
}

function cargarOccupantsEnSolucion(solution, occupants) {
    const { roomOccupancy } = solution;
    for (const o of occupants) {
        // o: { id, gender, age_group, length_of_stay, workload_produced, skill_level_required, room_id }
        const stay = o.length_of_stay;
        for (let offset = 0; offset < stay; offset++) {
            // Ocupan la cama en el día = offset (ocupante llega antes de d=0 y sale después de d=length_of_stay)
            if (offset < roomOccupancy.length) {
                const lista = roomOccupancy[offset].get(o.room_id);
                lista.push(o.id);
                // nota: no anotamos en patientAssigns porque no vamos a “volver a generar” su asignación; los tratamos como fijos.
            }
        }
    }
}

function construirPoolInicial(instance) {
    const D = instance.days;
    const rooms = instance.rooms; // [{ id, capacity }, …]
    const OTs = instance.operating_theaters; // [{ id, availability:[…] }, …]
    const surgeons = instance.surgeons; // [{ id, max_surgery_time:[…] }, …]
    const patients = instance.patients.filter(p => p.mandatory);
    // (si quisieras incluir opcionales en un segundo paso, podrías mantenerlos en otro array)

    // Creamos mapas rápidos: surgeonId → arreglo de max_surgery_time
    const surgeonMap = new Map();
    for (const s of surgeons) {
        surgeonMap.set(s.id, s.max_surgery_time);
    }

    // OTMap: OTid → availability array
    const OTMap = new Map();
    for (const t of OTs) {
        OTMap.set(t.id, t.availability);
    }

    const pool = [];
    for (const p of patients) {
        const release = p.surgery_release_day;
        const due = p.surgery_due_day; // estrictamente, dado que es obligatorio, lo tiene definido
        const length_of_stay = p.length_of_stay;
        const incomp = new Set(p.incompatible_room_ids);
        const surgeonAvail = surgeonMap.get(p.surgeon_id);
        const dur = p.surgery_duration;

        for (let d = release; d <= due; d++) {
            if (d < 0 || d >= D) continue;
            // 1) Comprobar cirujano en d: 
            if ((surgeonAvail[d] || 0) < dur) continue;

            // 2) Para cada quirófano t disponible ese día:
            for (const t of OTs) {
                if ((t.availability[d] || 0) < dur) continue;
                // 3) Para cada habitación no incompatible:
                for (const r of rooms) {
                    if (incomp.has(r.id)) continue;
                    // En principio, añadimos el candidato.  
                    // Más adelante, cuando "intentemos asignar", comprobaremos el resto de restricciones duras.
                    pool.push({
                        patientId: p.id,
                        day: d,
                        roomId: r.id,
                        OTid: t.id
                    });
                }
            }
        }
    }
    return pool;
}

function cumpleRestriccionesDurasyPoliticas(solution, candidate, instance, occupantMap) {
    const { patientAssigns, roomOccupancy, OTUsage, surgeonUsage } = solution;
    const { patientId, day: d, roomId: r, OTid: t } = candidate;

    // 0) No reasignar mismo paciente
    if (patientAssigns.has(patientId)) {
        // console.log(`Cannot assign patient ${patientId}: already assigned.`);
        return false;
    }

    // 0.1) Paciente existe
    const p = instance.patients.find(pac => pac.id === patientId);
    if (!p) {
        // console.log(`Cannot assign patient ${patientId}: patient record not found.`);
        return false;
    }

    // 0.5) Ventana de admisión
    const release = p.surgery_release_day;
    const due = p.mandatory
        ? p.surgery_due_day
        : instance.days - 1;
    if (d < release || d > due) {
        // console.log(`Cannot assign patient ${patientId} on day ${d}: outside admission window [${release}..${due}].`);
        return false;
    }

    // 0.6) Debe venir con OT
    if (t == null) {
        // console.log(`Cannot assign patient ${patientId} on day ${d}: no operating theater provided.`);
        return false;
    }

    const stay = p.length_of_stay;
    const gen = p.gender;
    const incomp = new Set(p.incompatible_room_ids);

    // 1) Compatibilidad de sala
    if (incomp.has(r)) {
        // console.log(`Cannot assign patient ${patientId} to room ${r}: room is incompatible.`);
        return false;
    }

    // 2) Capacidad y género en los días válidos de la estancia
    const roomObj = instance.rooms.find(x => x.id === r);
    if (!roomObj) {
        // console.log(`Cannot assign patient ${patientId} to room ${r}: room not found.`);
        return false;
    }

    for (let offset = 0; offset < stay; offset++) {
        const diaReal = d + offset;

        // Si el día es anterior al horizonte, seguimos; si pasa del último día, lo ignoramos
        if (diaReal < 0) {
            // console.log(`Patient ${patientId} stay starts before day 0 (day ${diaReal}): ignoring that day.`);
            continue;
        }
        if (diaReal >= instance.days) {
            // console.log(`Patient ${patientId} stay extends beyond planning horizon (day ${diaReal}): ignoring that day.`);
            break;  // a partir de aquí todos offset mayores también estarán fuera
        }

        const ocupantes = roomOccupancy[diaReal].get(r) || [];

        // 2a) Capacidad
        if (ocupantes.length + 1 > roomObj.capacity) {
            // console.log(`Cannot assign patient ${patientId} to room ${r} on day ${diaReal}: capacity exceeded (${ocupantes.length + 1}/${roomObj.capacity}).`);
            return false;
        }

        // 2b) Mezcla de géneros
        for (const otroId of ocupantes) {
            const gOtro = occupantMap.has(otroId)
                ? occupantMap.get(otroId).gender
                : (instance.patients.find(x => x.id === otroId) || {}).gender;
            if (gOtro !== gen) {
                // console.log(`Cannot assign patient ${patientId} (gender ${gen}) to room ${r} on day ${diaReal}: gender mix with patient ${otroId} (gender ${gOtro}).`);
                return false;
            }
        }
    }

    // 3) Cirujano
    const dur = p.surgery_duration;
    const surgeonId = p.surgeon_id;
    const surgeonObj = instance.surgeons.find(s => s.id === surgeonId);
    if (!surgeonObj) {
        // console.log(`Cannot assign patient ${patientId}: surgeon ${surgeonId} not found.`);
        return false;
    }
    const sUsoHoy = surgeonUsage[d].get(surgeonId) || 0;
    const maxCirHoy = surgeonObj.max_surgery_time[d] || 0;
    if (sUsoHoy + dur > maxCirHoy) {
        // console.log(`Cannot assign patient ${patientId} with surgeon ${surgeonId} on day ${d}: surgeon overload (${sUsoHoy + dur}/${maxCirHoy}).`);
        return false;
    }

    // 4) Quirófano
    const otObj = instance.operating_theaters.find(ot => ot.id === t);
    if (!otObj) {
        // console.log(`Cannot assign patient ${patientId}: OT ${t} not found.`);
        return false;
    }
    const otUsoHoy = OTUsage[d].get(t) || 0;
    const otCapHoy = otObj.availability[d] || 0;
    if (otUsoHoy + dur > otCapHoy) {
        // console.log(`Cannot assign patient ${patientId} to OT ${t} on day ${d}: OT overload (${otUsoHoy + dur}/${otCapHoy}).`);
        return false;
    }

    // Si llegamos aquí, la asignación es válida
    // console.log(`Assigning patient ${patientId} to day ${d}, room ${r}, OT ${t}.`);
    return true;
}

function fijarAsignacion(solution, candidate, instance) {
    const { patientAssigns, roomOccupancy, OTUsage, surgeonUsage } = solution;
    const { patientId, day: d, roomId: r, OTid: t } = candidate;
    const p = instance.patients.find(pac => pac.id === patientId);
    const stay = p.length_of_stay;
    const dur = p.surgery_duration;
    const surgeonId = p.surgeon_id;

    // 1) Registrar en patientAssigns
    patientAssigns.set(patientId, {
        day: d,
        room: r,
        operating_theater: t
    });

    // 2) Sumar ocupación de habitación para cada día válido en la estancia
    for (let offset = 0; offset < stay; offset++) {
        const diaReal = d + offset;
        // Solo si diaReal está dentro del planning [0 .. D-1]
        if (diaReal >= 0 && diaReal < roomOccupancy.length) {
            const listaEnDia = roomOccupancy[diaReal].get(r);
            listaEnDia.push(patientId);
        }
        // si está fuera, lo ignoramos
    }

    // 3) Sumar uso de OT y uso de cirujano para el día d (d está garantizado dentro de [0..D-1])
    OTUsage[d].set(t, (OTUsage[d].get(t) || 0) + dur);
    surgeonUsage[d].set(surgeonId, (surgeonUsage[d].get(surgeonId) || 0) + dur);
}

function heuristicaConstructivaIHTC(instance) {
    const D = instance.days;
    const rooms = instance.rooms;
    const OTs = instance.operating_theaters;
    const surgeons = instance.surgeons;
    const occupants = instance.occupants;
    const mandatoryPatients = instance.patients
        .filter(p => p.mandatory)
        .map(p => p.id);

    // 1) Inicializar la solución vacía e inyectar ocupantes fijos
    const solution = inicializarSolution(D, rooms, OTs, surgeons);
    const occupantMap = new Map();
    for (const o of occupants) occupantMap.set(o.id, o);
    cargarOccupantsEnSolucion(solution, occupants);

    // 2) Generar y barajar el pool inicial de candidatos
    let pool = _.shuffle(construirPoolInicial(instance));

    // 3) Conjunto de pendientes
    const pendientes = new Set(mandatoryPatients);

    // 4) Bucle principal con MRV
    while (pendientes.size > 0) {
        // ★ 4.1) Para cada pendiente, contamos cuántos candidatos le quedan
        let pacienteMRV = null;
        let minCandidatos = Infinity;
        for (const pid of pendientes) {
            const cnt = pool.reduce((sum, c) => sum + (c.patientId === pid ? 1 : 0), 0);
            if (cnt < minCandidatos) {
                minCandidatos = cnt;
                pacienteMRV = pid;
            }
        }

        // Si alguno tiene 0 candidatos, fallo inmediato
        if (minCandidatos === 0) {
            console.warn(
                `Heurística falló: el paciente ${pacienteMRV} no tiene candidatos disponibles.`, pendientes.size, "pendientes restantes."
            );
            return null;
        }

        // ★ 4.2) Extraemos sólo los candidatos de ese paciente
        const candidatos = pool.filter(c => c.patientId === pacienteMRV);

        // ★ 4.3) Elegimos uno al azar (puedes aquí reemplazar por un score si quieres)
        const eleccion = _.sample(candidatos);
        const { patientId } = eleccion;

        // 4.4) Comprobamos restricciones duras
        if (cumpleRestriccionesDurasyPoliticas(solution, eleccion, instance, occupantMap)) {
            // ✓ Asignamos y actualizamos
            fijarAsignacion(solution, eleccion, instance);
            pendientes.delete(patientId);
            // Eliminamos todos los candidatos de ese paciente
            pool = pool.filter(c => c.patientId !== patientId);
        } else {
            // ✗ Descartamos sólo este candidato e intentamos continuar
            pool = pool.filter(c =>
                !(
                    c.patientId === eleccion.patientId &&
                    c.day === eleccion.day &&
                    c.roomId === eleccion.roomId &&
                    c.OTid === eleccion.OTid
                )
            );
        }
    }

    return solution;
}

function construirRequerimientosEnfermeras(solution, instance) {
    const D = instance.days;
    const roomOcc = solution.roomOccupancy;
    const patients = instance.patients;
    const patientMap = new Map(patients.map(p => [p.id, p]));
    // Shift → índice en [0,1,2]
    const shiftIndex = { early: 0, late: 1, night: 2 };

    // RN[d][r][s] tendrá { totalWorkload, minSkill, patientIds: [...] }
    const RN = Array.from({ length: D }, () => ({}));
    for (let d = 0; d < D; d++) {
        RN[d] = {}; // RN[d] será un objeto roomId→{ early:{…}, late:{…}, night:{…} }
        for (const [rId, lista] of solution.roomOccupancy[d].entries()) {
            if (!lista || lista.length === 0) continue;
            RN[d][rId] = {
                early: { totalWorkload: 0, minSkill: 0, patientIds: [] },
                late: { totalWorkload: 0, minSkill: 0, patientIds: [] },
                night: { totalWorkload: 0, minSkill: 0, patientIds: [] }
            };
            // Para cada paciente en la habitación
            for (const pid of lista) {
                // Puede ser occupant o paciente “nuevo”:
                const p = patientMap.get(pid) || null;
                // Si es occupant, asumimos que occupancy-kicks in desde el día 0,
                // pero no sabemos su workload_produced; si el JSON de "occupants" 
                // incluyera workload_produced y skill_level_required, haríamos algo similar.
                if (p) {
                    const stay = p.length_of_stay;
                    // calculamos índice base en el vector workload_produced:
                    // si el paciente ingresó en day0 = p.surgery_release_day, pues
                    // su “primer turno” en hospital es turno (d = ingreso, shift early) = índice 0 de workload_produced.
                    // Aquí simplificaremos: asumimos que el vector workload_produced está alineado
                    // con la estancia: i.e. workload_produced[0] es el turno early del día de ingreso, y así.
                    const { day: admitDay } = solution.patientAssigns.get(pid);
                    const baseIdx = (d - admitDay) * 3;
                    for (const sft of ["early", "late", "night"]) {
                        const idx = baseIdx + shiftIndex[sft];
                        if (idx < 0 || idx >= p.workload_produced.length) continue;
                        RN[d][rId][sft].totalWorkload += p.workload_produced[idx];
                        RN[d][rId][sft].minSkill = Math.max(RN[d][rId][sft].minSkill, p.skill_level_required[idx]);
                        RN[d][rId][sft].patientIds.push(pid);
                    }
                } else {
                    // Si pid es occupant, necesitaríamos un campo similar a workload_produced
                    // y skill_level_required en “occupants”. Para este ejemplo asumimos que occupant
                    // incluye esos vectores y procedemos idéntico. 
                    const occ = instance.occupants.find(o => o.id === pid);
                    if (!occ) continue;
                    // misma lógica, asumiendo que occ.workload_produced y occ.skill_level_required existen
                    const { day: _ignored } = { day: 0 }; // su "admitDay" real es <0, pero
                    // para occupant el vector ya comienza en d=0, así que baseIdx = 0 cuando d=0,
                    // baseIdx = 3 cuando d=1, etc.
                    const baseIdx = d * 3;
                    for (const sft of ["early", "late", "night"]) {
                        const idx = baseIdx + shiftIndex[sft];
                        if (idx < 0 || idx >= occ.workload_produced.length) continue;
                        RN[d][rId][sft].totalWorkload += occ.workload_produced[idx];
                        RN[d][rId][sft].minSkill = Math.max(RN[d][rId][sft].minSkill, occ.skill_level_required[idx]);
                        RN[d][rId][sft].patientIds.push(pid);
                    }
                }
            }
        }
    }
    return RN;
}

function asignarEnfermeras(solution, instance) {
    const D = instance.days;
    const nurses = instance.nurses;
    // Construimos nurseAvailable[d][shift] = Set de enfermeras disponibles
    // y nurseMaxLoad[nurseId][d][shift] = número
    const nurseAvailable = Array.from({ length: D }, () => ({
        early: new Set(),
        late: new Set(),
        night: new Set()
    }));
    const nurseMaxLoad = {}; // nurseMaxLoad[nurseId] = Array[d] → { early: x, late: y, night: z }
    for (const n of nurses) {
        nurseMaxLoad[n.id] = Array.from({ length: D }, () => ({ early: 0, late: 0, night: 0 }));
        for (const ws of n.working_shifts) {
            // ws = { day, shift, max_load }
            nurseAvailable[ws.day][ws.shift].add(n.id);
            nurseMaxLoad[n.id][ws.day][ws.shift] = ws.max_load;
        }
    }

    // Construimos la tabla RN
    const RN = construirRequerimientosEnfermeras(solution, instance);

    // nurseAssigns: Map nurseId → array de { day, shift, rooms }
    const nurseAssigns = new Map();
    for (const n of nurses) {
        nurseAssigns.set(n.id, []);
    }

    // Para cada día y shift, iremos asignando habitación por habitación
    for (let d = 0; d < D; d++) {
        for (const shift of ["early", "late", "night"]) {
            // copio el set de disponibles a un array para muestrearlo
            let disponibles = Array.from(nurseAvailable[d][shift]);
            // Mezclo el array para aleatorizar
            disponibles = _.shuffle(disponibles);

            // Lista de habitaciones ocupadas ese día (las que tengan RN[d][r] definido y no vacío)
            const roomsHoy = Object.keys(RN[d] || {});
            for (const rId of roomsHoy) {
                const req = RN[d][rId][shift];
                // Si no hay pacientes en esa habitación en este turno, seguimos
                if (!req || req.patientIds.length === 0) continue;
                const W = req.totalWorkload;
                const Smin = req.minSkill;

                // Busco en “disponibles” una enfermera que cumpla (carga y skill)
                let elegida = null;
                for (const nurseId of disponibles) {
                    const nObj = nurses.find(n => n.id === nurseId);
                    const currentLoad = nurseMaxLoad[nurseId][d][shift];
                    // en realidad “currentLoad” es el máximo, y nosotros mantenemos un 
                    // contador de “loadAssigned[nurseId][d][shift]” que arranca en 0
                    // y vamos sumando W. Implementamos ese contador:
                    if (!nurseAssigns.loadAssigned) nurseAssigns.loadAssigned = {};
                    if (!nurseAssigns.loadAssigned[nurseId]) {
                        nurseAssigns.loadAssigned[nurseId] = Array.from({ length: D }, () => ({
                            early: 0,
                            late: 0,
                            night: 0
                        }));
                    }
                    const usedSoFar = nurseAssigns.loadAssigned[nurseId][d][shift];
                    const maxSoFar = nObj.skill_level >= Smin ? currentLoad : -1;
                    // Si la skill no alcanza Smin, marcamos maxSoFar = -1 para forzar que no se elija
                    if (maxSoFar >= 0 && usedSoFar + W <= maxSoFar) {
                        elegida = nurseId;
                        break;
                    }
                }
                if (elegida === null) {
                    // No hay enfermera que cumpla skill+carga al 100%. Como fallback,
                    // podemos buscar que cumpla solo carga (aceptando infraskill) OR
                    // marcar infactivo. Aquí elegimos “aceptar infraskill”:
                    for (const nurseId of disponibles) {
                        const usedSoFar = nurseAssigns.loadAssigned[nurseId][d][shift];
                        const maxSoFar = nurseMaxLoad[nurseId][d][shift];
                        if (maxSoFar >= 0 && usedSoFar + W <= maxSoFar) {
                            elegida = nurseId;
                            break;
                        }
                    }
                }

                if (elegida !== null) {
                    // 1) Actualizar loadAssigned
                    nurseAssigns.loadAssigned[elegida][d][shift] += W;
                    // 2) Añadir a nurseAssigns[elegida] el par { day:d, shift, rooms:[…] }
                    const arr = nurseAssigns.get(elegida);
                    // Buscamos si ya hay un objeto para este (d,shift)
                    let entry = arr.find(x => x.day === d && x.shift === shift);
                    if (!entry) {
                        entry = { day: d, shift: shift, rooms: [] };
                        arr.push(entry);
                    }
                    entry.rooms.push(rId);
                }
                // Si elegida sigue null, dejamos la habitación “sin asignar” → violación dura
                // (la solución global sería infactible). Para esta heurística asumimos que
                // las instancias públicas normalmente permitirán asignar alguna enfermera.
            } // fin for roomsHoy
        } // fin for shift
    } // fin for d

    // Finalmente, convertimos nurseAssigns.loadAssigned de forma oculta y devolvemos
    // solo el Map nurseId → [ { day, shift, rooms } ]
    for (const nurseId of nurseAssigns.keys()) {
        const arr = nurseAssigns.get(nurseId).filter(x => x.rooms.length > 0);
        nurseAssigns.set(nurseId, arr);
    }
    delete nurseAssigns.loadAssigned;
    return nurseAssigns;
}

function ejecutarHeuristicaIHTC(instance, maxRetries = 10) {
    // 1) Intentamos generar asignaciones de pacientes (múltiples reintentos si falla)
    let solPacientes = null;
    for (let intento = 0; intento < maxRetries; intento++) {
        solPacientes = heuristicaConstructivaIHTC(instance);
        if (solPacientes) break;
        // Si devuelve null, reintentamos (internamente barajeando pool de nuevo).
    }
    if (!solPacientes) {
        console.error(
            "No se pudo generar una asignación factible de pacientes tras",
            maxRetries,
            "intentos."
        );
        return null;
    }

    // 2) Asignamos enfermeras sobre la solución de pacientes obtenida
    const solEnfermeras = asignarEnfermeras(solPacientes, instance);

    // 3) Serializamos “patients” en un array, incluyendo los no asignados con admission_day:"none"
    const patientsOutput = [];
    // Hacemos una copia del array de pacientes y lo ordenamos por id alfanumérica
    const todosPatients = [...instance.patients].sort((a, b) =>
        a.id.localeCompare(b.id)
    );
    for (const p of todosPatients) {
        if (solPacientes.patientAssigns.has(p.id)) {
            // Si el paciente sí está asignado, extraemos su info de admission_day, room y OT
            const info = solPacientes.patientAssigns.get(p.id);
            patientsOutput.push({
                id: p.id,
                admission_day: info.day,
                room: info.room,
                operating_theater: info.operating_theater
            });
        } else {
            // Si no figura en patientAssigns, lo marcamos como no admitido
            patientsOutput.push({
                id: p.id,
                admission_day: "none"
            });
        }
    }

    // 4) Serializamos “nurses” en un array igual que antes
    const nursesOutput = [];
    for (const n of instance.nurses) {
        nursesOutput.push({
            id: n.id,
            assignments: solEnfermeras.get(n.id) || []
        });
    }

    return {
        patients: patientsOutput,
        nurses: nursesOutput
    };
}

module.exports = {
    ejecutarHeuristicaIHTC,
};