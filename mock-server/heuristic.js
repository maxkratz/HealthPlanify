const _ = require('lodash'); // para sample y shuffle

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
    const rooms = instance.rooms;
    const OTs = instance.operating_theaters;
    const surgeonMap = new Map(instance.surgeons.map(s => [s.id, s.max_surgery_time]));
    const pool = [];

    for (const p of instance.patients) {
        const { id: patientId,
            surgery_release_day: release,
            surgery_due_day: surgeryDue,
            mandatory,
            incompatible_room_ids: incompatibleRooms,
            surgeon_id,
            surgery_duration: dur } = p;
        const due = mandatory ? surgeryDue : D - 1;
        const incomp = new Set(incompatibleRooms);
        const surgeonAvail = surgeonMap.get(surgeon_id);

        if (!Array.isArray(surgeonAvail)) {
            console.warn(`Cirujano ${surgeon_id} sin datos de disponibilidad`);
            continue;
        }

        for (let day = release; day <= due; day++) {
            if (day < 0 || day >= D) continue;
            if ((surgeonAvail[day] || 0) < dur) continue;

            for (const ot of OTs) {
                if ((ot.availability[day] || 0) < dur) continue;

                for (const room of rooms) {
                    if (incomp.has(room.id)) continue;
                    pool.push({ patientId, day, roomId: room.id, OTid: ot.id });
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

    // 1) Inicializar solución e inyectar ocupantes fijos
    const solution = inicializarSolution(D, rooms, OTs, surgeons);
    const occupantMap = new Map(occupants.map(o => [o.id, o]));
    cargarOccupantsEnSolucion(solution, occupants);

    // 2) Generar pool completo y separar mandatorios/opcionales
    const allCandidates = construirPoolInicial(instance);
    let poolMand = _.shuffle(
        allCandidates.filter(c => instance.patients.find(p => p.id === c.patientId).mandatory)
    );
    let poolOpt = _.shuffle(
        allCandidates.filter(c => !instance.patients.find(p => p.id === c.patientId).mandatory)
    );

    // Listas de IDs
    const mandatorios = instance.patients.filter(p => p.mandatory).map(p => p.id);
    const opcionales = instance.patients.filter(p => !p.mandatory).map(p => p.id);

    // Función genérica de asignación por MRV con muestreo aleatorio y poda dinámica
    function asignarConMRV(pool, pendientesArray, esOpcional = false) {
        const pendientes = new Set(pendientesArray);
        while (pendientes.size > 0) {
            // 1) Encontrar paciente MRV
            let pacienteMRV = null;
            let minCnt = Infinity;
            for (const pid of pendientes) {
                const cnt = pool.reduce((sum, c) => sum + (c.patientId === pid ? 1 : 0), 0);
                if (cnt < minCnt) {
                    minCnt = cnt;
                    pacienteMRV = pid;
                }
            }
            // 2) Si no hay candidatos
            if (minCnt === 0) {
                if (esOpcional) {
                    pendientes.delete(pacienteMRV);
                    continue;
                } else {
                    console.warn(`Sin candidatos para obligatorio ${pacienteMRV}.`);
                    return false;
                }
            }

            // 3) Muestreo aleatorio entre candidatos
            let candidatos = pool.filter(c => c.patientId === pacienteMRV);
            let assigned = false;
            while (candidatos.length > 0) {
                const eleccion = _.sample(candidatos);
                if (cumpleRestriccionesDurasyPoliticas(solution, eleccion, instance, occupantMap)) {
                    // Encaja: asignar y actualizar
                    fijarAsignacion(solution, eleccion, instance);
                    const pObj = instance.patients.find(p => p.id === eleccion.patientId);
                    occupantMap.set(eleccion.patientId, pObj);
                    pendientes.delete(pacienteMRV);
                    // Eliminar todos los candidatos de este paciente
                    pool = pool.filter(c => c.patientId !== pacienteMRV);
                    // Poda dinámica: quitar candidatos inválidos tras asignación
                    pool = pool.filter(c => cumpleRestriccionesDurasyPoliticas(solution, c, instance, occupantMap));
                    assigned = true;
                    break;
                } else {
                    // Descartar solo este candidato
                    const { patientId, day, roomId, OTid } = eleccion;
                    candidatos = candidatos.filter(c =>
                        !(c.patientId === patientId && c.day === day && c.roomId === roomId && c.OTid === OTid)
                    );
                    pool = pool.filter(c =>
                        !(c.patientId === patientId && c.day === day && c.roomId === roomId && c.OTid === OTid)
                    );
                }
            }
            // 4) Si ninguno encajó
            if (!assigned) {
                if (esOpcional) pendientes.delete(pacienteMRV);
                else return false;
            }
        }
        return true;
    }

    // 3) Asignar pacientes mandatorios
    if (!asignarConMRV(poolMand, mandatorios, false)) {
        console.error("No se pudo asignar todos los pacients obligatorios.");
        return null;
    }

    // 4) Reconstruir pool de opcionales tras bloquear solución parcial
    poolOpt = _.shuffle(
        construirPoolInicial(instance)
            .filter(c => opcionales.includes(c.patientId))
            .filter(c => cumpleRestriccionesDurasyPoliticas(solution, c, instance, occupantMap))
    );

    // 5) Asignar pacientes opcionales
    asignarConMRV(poolOpt, opcionales, true);

    return solution;
}

function construirRequerimientosEnfermeras(solution, instance) {
    const D = instance.days;
    const shiftIndex = { early: 0, late: 1, night: 2 };

    // 1) Combinar pacientes y occupants en un solo mapa de entidades con admitDay, workload y skill.
    const combined = new Map();
    for (const p of instance.patients) {
        const info = solution.patientAssigns.get(p.id);
        if (info) {
            combined.set(p.id, {
                admitDay: info.day,
                workload: p.workload_produced,
                skill: p.skill_level_required,
            });
        }
    }
    for (const o of instance.occupants) {
        if (Array.isArray(o.workload_produced) && Array.isArray(o.skill_level_required)) {
            combined.set(o.id, {
                admitDay: 0,
                workload: o.workload_produced,
                skill: o.skill_level_required,
            });
        }
    }

    // 2) Inicializar RN como Array de Maps: RN[d] → Map(roomId → Map(shift → req))
    const RN = Array.from({ length: D }, () => new Map());
    for (let d = 0; d < D; d++) {
        for (const [roomId, occupants] of solution.roomOccupancy[d].entries()) {
            if (!occupants.length) continue;
            const shiftMap = new Map([
                ['early', { totalWorkload: 0, minSkill: Infinity, patientIds: [] }],
                ['late', { totalWorkload: 0, minSkill: Infinity, patientIds: [] }],
                ['night', { totalWorkload: 0, minSkill: Infinity, patientIds: [] }],
            ]);

            for (const id of occupants) {
                const ent = combined.get(id);
                if (!ent) continue;
                const { admitDay, workload, skill } = ent;
                const baseIdx = (d - admitDay) * 3;

                for (const [shift, idxOffset] of Object.entries(shiftIndex)) {
                    const idx = baseIdx + idxOffset;
                    if (idx < 0 || idx >= workload.length) continue;
                    const req = shiftMap.get(shift);
                    req.totalWorkload += workload[idx];
                    req.minSkill = Math.min(req.minSkill, skill[idx]);
                    req.patientIds.push(id);
                }
            }

            for (const req of shiftMap.values()) {
                if (req.minSkill === Infinity) req.minSkill = 0;
            }

            RN[d].set(roomId, shiftMap);
        }
    }

    return RN;
}

function asignarEnfermeras(solution, instance) {
    const D = instance.days;
    const nurses = instance.nurses;

    // 1) Disponibilidad y capacidad
    const nurseAvailable = Array.from({ length: D }, () => ({ early: new Set(), late: new Set(), night: new Set() }));
    const nurseMaxLoad = new Map();
    const nurseMap = new Map(nurses.map(n => [n.id, n]));

    for (const n of nurses) {
        const maxArr = Array.from({ length: D }, () => ({ early: 0, late: 0, night: 0 }));
        nurseMaxLoad.set(n.id, maxArr);
        for (const ws of n.working_shifts) {
            nurseAvailable[ws.day][ws.shift].add(n.id);
            maxArr[ws.day][ws.shift] = ws.max_load;
        }
    }

    // 2) Requerimientos
    const RN = construirRequerimientosEnfermeras(solution, instance);

    // 3) Contador de carga asignada
    const loadAssigned = new Map();
    for (const n of nurses) {
        loadAssigned.set(n.id, Array.from({ length: D }, () => ({ early: 0, late: 0, night: 0 })));
    }

    // 4) Asignaciones
    const nurseAssigns = new Map(nurses.map(n => [n.id, []]));

    // 5) Recorrer días y turnos
    for (let d = 0; d < D; d++) {
        for (const shift of ['early', 'late', 'night']) {
            let disponibles = Array.from(nurseAvailable[d][shift]);
            const roomsHoy = Array.from(RN[d].entries())
                .filter(([, shifts]) => shifts.get(shift).patientIds.length > 0)
                .sort(([, a], [, b]) => b.get(shift).totalWorkload - a.get(shift).totalWorkload)
                .map(([rId]) => rId);

            for (const rId of roomsHoy) {
                const req = RN[d].get(rId).get(shift);
                const W = req.totalWorkload;
                const Smin = req.minSkill;

                // Buscar enfermera ideal dentro de límites
                let bestId = null;
                let bestMetric = null;
                for (const nurseId of disponibles) {
                    const nObj = nurseMap.get(nurseId);
                    const used = loadAssigned.get(nurseId)[d][shift];
                    const maxCap = nurseMaxLoad.get(nurseId)[d][shift];
                    if (used + W > maxCap) continue;

                    const skillGap = Math.max(0, Smin - nObj.skill_level);
                    const loadGap = maxCap - used;
                    const metric = [skillGap, -loadGap];
                    if (!bestMetric || metric[0] < bestMetric[0] || (metric[0] === bestMetric[0] && metric[1] > bestMetric[1])) {
                        bestId = nurseId;
                        bestMetric = metric;
                    }
                }

                // Fallback: asignar aun excediendo límites
                if (bestId === null) {
                    let fallbackId = null;
                    let fallbackMetric = null;
                    for (const nurseId of disponibles) {
                        const nObj = nurseMap.get(nurseId);
                        const used = loadAssigned.get(nurseId)[d][shift];
                        const maxCap = nurseMaxLoad.get(nurseId)[d][shift];
                        const skillGap = Math.max(0, Smin - nObj.skill_level);
                        const overload = Math.max(0, used + W - maxCap);
                        const metric = [skillGap, overload];
                        if (!fallbackMetric || metric[0] < fallbackMetric[0] || (metric[0] === fallbackMetric[0]
                            && metric[1] < fallbackMetric[1])) {
                            fallbackId = nurseId;
                            fallbackMetric = metric;
                        }
                    }
                    bestId = fallbackId;
                }

                if (bestId !== null) {
                    loadAssigned.get(bestId)[d][shift] += W;
                    const arr = nurseAssigns.get(bestId);
                    let entry = arr.find(e => e.day === d && e.shift === shift);
                    if (!entry) {
                        entry = { day: d, shift, rooms: [] };
                        arr.push(entry);
                    }
                    entry.rooms.push(rId);

                    if (loadAssigned.get(bestId)[d][shift] >= nurseMaxLoad.get(bestId)[d][shift]) {
                        disponibles = disponibles.filter(id => id !== bestId);
                    }
                }
            }
        }
    }

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