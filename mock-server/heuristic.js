const _ = require('lodash'); // para sample, shuffle

/** Crea la estructura vacía para ir almacenando asignaciones. */
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

/**
 * Inserta en roomOccupancy[a día][room] a cada “occupant” para forzar
 * que esas camas ya estén ocupadas.
 */
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

/**
 * Construye el pool inicial de candidatos { patientId, day, roomId, OTid },
 * sin comprobar aún capacidad real en los siguientes días—solo la ventana de admisión,
 * quirófano y cirujano. 
 */
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

/**
 * Comprueba todas las restricciones duras para asignar “candidate” en la sol actual.
 * Devuelve true si se puede “fijar” definitivamente.
 */
function cumpleRestriccionesDurasyPoliticas(solution, candidate, instance, occupantMap) {
    // solution: { patientAssigns, roomOccupancy, OTUsage, surgeonUsage }
    const { patientAssigns, roomOccupancy, OTUsage, surgeonUsage } = solution;
    const { patientId, day: d, roomId: r, OTid: t } = candidate;
    const patients = instance.patients;
    const patientMap = new Map(patients.map(p => [p.id, p]));
    const rooms = instance.rooms;
    const roomMap = new Map(rooms.map(rm => [rm.id, rm]));
    const OTs = instance.operating_theaters;
    const OTMap = new Map(OTs.map(ot => [ot.id, ot]));
    const surgeons = instance.surgeons;
    const surgeonMap = new Map(surgeons.map(s => [s.id, s]));

    // 0) Si el paciente ya está asignado en otro sitio, falla:
    if (patientAssigns.has(patientId)) return false;

    const p = patientMap.get(patientId);
    const stay = p.length_of_stay;            // número de días a ocupar
    const gen = p.gender;                     // "A"|"B"
    const ageGrp = p.age_group;               // (para soft, no aquí)
    const incomp = new Set(p.incompatible_room_ids);

    // 1) Verificar que 'r' no está en incompatible (pero ya lo hizo el pool).
    if (incomp.has(r)) return false;

    // 2) Comprobar que, para TODOS los días de la estancia (d … d+stay-1):
    //    - 0 ≤ d+i < D
    //    - La capacidad de la habitación (roomMap.get(r).capacity) no se excede
    //    - No hay mezcla de género
    //    - (Los ocupantes fijos ya están en roomOccupancy, se cuentan)
    for (let offset = 0; offset < stay; offset++) {
        const diaReal = d + offset;
        if (diaReal < 0 || diaReal >= instance.days) return false;

        // 2a) Capacidad
        const listaEnDia = roomOccupancy[diaReal].get(r);
        const capacidad = roomMap.get(r).capacity;
        if (listaEnDia.length + 1 > capacidad) return false;

        // 2b) Género mix
        for (const otroId of listaEnDia) {
            // Si es un occupant fijo, tomamos su género de occupantMap
            // Si es un paciente asignado en runtime, hay que sacarlo de patientMap.
            const gOtro = occupantMap.has(otroId)
                ? occupantMap.get(otroId).gender
                : patientMap.get(otroId).gender;
            if (gOtro !== gen) return false;
        }
    }

    // 3) Verificar quirófano y cirujano para el día d (la cirugía se asume en d):
    const surgeonId = p.surgeon_id;
    const dur = p.surgery_duration;
    const sUsoHoy = surgeonUsage[d].get(surgeonId) || 0;
    const maxCirujanoHoy = surgeonMap.get(surgeonId).max_surgery_time[d] || 0;
    if (sUsoHoy + dur > maxCirujanoHoy) return false;

    const otUsoHoy = OTUsage[d].get(t) || 0;
    const otCapHoy = OTMap.get(t).availability[d] || 0;
    if (otUsoHoy + dur > otCapHoy) return false;

    // 4) Asegurarnos de que no haya ya otro “patientAssigns” con este patientId
    //    (lo hacemos al inicio). Y que no haya ya “otro room+day” con el mismo p—ya cubierto.

    return true; // si no ha saltado ningún return false, se puede asignar.
}

/**
 * Asigna definitivamente un candidato en la solución (se llama si pasó todas las restricciones).
 */
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

    // 2) Sumar ocupación de habitación para cada día en la estancia
    for (let offset = 0; offset < stay; offset++) {
        const diaReal = d + offset;
        const listaEnDia = roomOccupancy[diaReal].get(r);
        listaEnDia.push(patientId);
    }

    // 3) Sumar uso de OT y uso de cirujano para el día d
    OTUsage[d].set(t, (OTUsage[d].get(t) || 0) + dur);
    surgeonUsage[d].set(surgeonId, (surgeonUsage[d].get(surgeonId) || 0) + dur);
}

/**
 * Heurística constructiva pura: intenta ubicar TODOS los obligatorios.
 * Devuelve la solución parcial (o null si falla).
 */
function heuristicaConstructivaIHTC(instance) {
    const D = instance.days;
    const rooms = instance.rooms;
    const OTs = instance.operating_theaters;
    const surgeons = instance.surgeons;
    const occupants = instance.occupants;       // pacientes ya ingresados
    const mandatoryPatients = instance.patients
        .filter(p => p.mandatory)
        .map(p => p.id);

    // 1) Inicializar la solución vacía e inyectar ocupantes fijos
    const solution = inicializarSolution(D, rooms, OTs, surgeons);

    // Creamos un Map de occupants (solo para chequear el género en roomOccupancy)
    const occupantMap = new Map();
    for (const o of occupants) {
        occupantMap.set(o.id, o);
    }
    cargarOccupantsEnSolucion(solution, occupants);

    // 2) Generar el pool inicial de candidatos
    let pool = construirPoolInicial(instance);
    // Barajamos el array para aleatorizar un poco
    pool = _.shuffle(pool);

    // 3) Preparar el conjunto de obligatorios pendientes
    const pendientes = new Set(mandatoryPatients);

    // 4) Bucle principal: mientras queden obligatorios
    while (pendientes.size > 0) {
        console.log(`Pendientes: ${pendientes.size} obligatorios por ubicar.`);
        // Filtrar pool para quedarnos con candidatos cuyo paciente esté en pendientes
        const posibles = pool.filter(c => pendientes.has(c.patientId));
        if (posibles.length === 0) {
            // No quedan candidatos para ubicar a ninguno de los pendientes: falla
            console.warn("Heurística falló: no hay más candidatos para ubicar a los obligatorios.");
            return null;
        }

        // Elegimos uno al azar
        const eleccion = _.sample(posibles);
        const { patientId } = eleccion;

        console.log(`Intentando ubicar paciente ${patientId} en día ${eleccion.day}, habitación ${eleccion.roomId}, OT ${eleccion.OTid}.`);
        // Comprobamos restricciones duras
        if (cumpleRestriccionesDurasyPoliticas(solution, eleccion, instance, occupantMap)) {
            console.log(`✓ Asignación válida para paciente ${patientId}.`);
            // ✓ Podemos asignarlo: lo fijamos y actualizamos estructuras
            fijarAsignacion(solution, eleccion, instance);
            // Lo marcamos como colocado
            pendientes.delete(patientId);
            // Eliminamos del pool TODO candidato con patientId == este paciente
            pool = pool.filter(c => c.patientId !== patientId);
            console.log(`Paciente ${patientId} asignado correctamente.`);
        } else {
            console.log(`✗ Asignación inválida para paciente ${patientId}. Descartando candidato.`);
            // ✗ No es válido: descartamos solo este candidato
            pool = pool.filter(c =>
                !(c.patientId === eleccion.patientId &&
                    c.day === eleccion.day &&
                    c.roomId === eleccion.roomId &&
                    c.OTid === eleccion.OTid)
            );
            console.warn(`Paciente ${patientId} no pudo ser asignado en el candidato elegido.`);
        }
    }

    console.log("Todos los pacientes obligatorios han sido asignados correctamente.");
    // Si llegamos aquí, hemos colocado a todos los obligatorios correctamente.
    return solution;
}

/**
 * Construye una estructura intermedia RN[d][roomId][shift] = { totalWorkload, minSkill }.
 */
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

/**
 * Una vez tenemos RN[d][roomId][shift], asigna enfermeras aleatoriamente:
 *  - nurseAvailable[d][shift] = Set de nurseIds disponibles,
 *    y nurseMaxLoad[nurseId][d][shift] = valor máximo;
 *  - asignar tantas habitaciones como podamos a cada enfermera (sin exceder carga).
 *
 * Devuelve nurseAssigns: Map nurseId → [ { day, shift, rooms: [r1,…] }, … ]
 */
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

/**
 * Orquesta la ejecución completa: pacientes + enfermeras.
 * Devuelve un objeto listo para exportar a JSON con la forma que pide el validador,
 * asegurándose de que TODOS los pacientes aparezcan (los no asignados con admission_day:"none").
 */
function ejecutarHeuristicaIHTC(instance, maxRetries = 100) {
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