import { InputFile } from "../../types/InputFile";
import { SolutionFile } from "../../types/SolutionFile";
import { PatientFullData } from "../../types/Combined";

export function calculateNurseGlobalConstraints(
    inputData: InputFile,
    solutionData: SolutionFile
): {
    globalS2Weighted: number;
    globalS3Weighted: number;
    globalS4Weighted: number;
    nursePenalties: {
        nurseId: string;
        S2: number;
        S3: number;
        S4: number;
    }[];
} {
    if (!inputData || !solutionData) {
        return {
            globalS2Weighted: 0,
            globalS3Weighted: 0,
            globalS4Weighted: 0,
            nursePenalties: [],
        };
    }

    const { weights } = inputData;

    // --- Cálculo de S3: Continuidad de cuidado global ---
    // Inicializa las contribuciones de continuidad para cada enfermera en 0.
    const patientContinuityContributions: Record<string, number> = {};
    inputData.nurses.forEach(nurse => {
        patientContinuityContributions[nurse.id] = 0;
    });

    // A. Contribución a S3 a partir de los pacientes de la solución.
    (solutionData.patients || []).forEach(patient => {
        if (typeof patient.admission_day !== "number") return;
        const inputPatient = inputData.patients.find(p => p.id === patient.id);
        if (!inputPatient) return;
        const admissionDay = patient.admission_day;
        const dischargeDay = admissionDay + inputPatient.length_of_stay;
        const nurseSet = new Set<string>();
        (solutionData.nurses || []).forEach(nurseSol => {
            nurseSol.assignments.forEach(assignment => {
                if (assignment.day >= admissionDay && assignment.day < dischargeDay) {
                    if (assignment.rooms.includes(patient.room)) {
                        nurseSet.add(nurseSol.id);
                    }
                }
            });
        });
        nurseSet.forEach(nurseId => {
            patientContinuityContributions[nurseId] += 1;
        });
    });

    // B. Contribución a S3 a partir de los ocupantes (presentes desde el día 0).
    (inputData.occupants || []).forEach(occupant => {
        const admissionDay = 0;
        const dischargeDay = occupant.length_of_stay;
        const nurseSet = new Set<string>();
        (solutionData.nurses || []).forEach(nurseSol => {
            nurseSol.assignments.forEach(assignment => {
                if (assignment.day >= admissionDay && assignment.day < dischargeDay) {
                    if (assignment.rooms.includes(occupant.room_id)) {
                        nurseSet.add(nurseSol.id);
                    }
                }
            });
        });
        nurseSet.forEach(nurseId => {
            patientContinuityContributions[nurseId] += 1;
        });
    });

    // --- Preparación para S2 y S4: Listado combinado de "pacientes" ---
    // Se unen los pacientes de la solución y los ocupantes adaptados al mismo formato.
    const allPatients = [
        ...(solutionData.patients || []),
        ...((inputData.occupants || []).map(occ => ({
            id: occ.id,
            admission_day: 0,
            room: occ.room_id,
            length_of_stay: occ.length_of_stay,
            workload_produced: occ.workload_produced,
            skill_level_required: occ.skill_level_required,
        })))
    ];

    let globalS2 = 0;
    let globalS4 = 0;

    // --- Cálculo de las penalizaciones por enfermera (S2, S4 y S3) ---
    const nursePenalties = inputData.nurses.map(nurse => {
        let S2_total = 0;
        let S4_total = 0;
        const nurseSolution = solutionData.nurses.find(n => n.id === nurse.id);
        if (nurseSolution) {
            nurseSolution.assignments.forEach(assignment => {
                const currentDay = assignment.day;
                const currentShift = assignment.shift;
                // Se busca el turno de trabajo para obtener el máximo permitido (maxLoad).
                const workingShift = nurse.working_shifts.find(
                    ws => ws.day === currentDay && ws.shift === currentShift
                );
                const maxLoad = workingShift ? workingShift.max_load : 0;

                // Se filtran los pacientes asignados en la asignación actual.
                const assignedPatients = allPatients
                    .filter(patient => {
                        if (typeof patient.admission_day !== 'number') return false;
                        if (patient.admission_day > currentDay) return false;
                        const inputPatient = (inputData.patients.find(p => p.id === patient.id) || patient) as PatientFullData;

                        if (!inputPatient) return false;
                        if (currentDay >= patient.admission_day + inputPatient.length_of_stay) return false;
                        return assignment.rooms.includes(patient.room);
                    })
                    .map(patient => {
                        const inputPatient = (inputData.patients.find(p => p.id === patient.id) || patient) as PatientFullData;
                        if (!inputPatient) return null;
                        // Se define un orden para los turnos: early, late, night.
                        const shiftOrder: Record<string, number> = { early: 0, late: 1, night: 2 };
                        const shiftOrdinal = shiftOrder[currentShift];
                        if (typeof patient.admission_day !== 'number') return false;
                        const dayOffset = currentDay - patient.admission_day;
                        const shiftIndex = dayOffset * 3 + shiftOrdinal;
                        const requiredSkill = inputPatient.skill_level_required[shiftIndex] ?? 0;
                        const workload = inputPatient.workload_produced[shiftIndex] ?? 0;
                        return { requiredSkill, workload };
                    })
                    .filter((p): p is { requiredSkill: number; workload: number } => p !== null);

                // Penalización S2: diferencia entre lo requerido y la habilidad de la enfermera.
                const S2_assignment = assignedPatients.reduce(
                    (sum, p) => sum + Math.max(0, p.requiredSkill - nurse.skill_level),
                    0
                );
                S2_total += S2_assignment;

                // Penalización S4: carga de trabajo en exceso respecto al máximo permitido.
                const totalWorkload = assignedPatients.reduce(
                    (sum, p) => sum + p.workload,
                    0
                );
                const S4_assignment = totalWorkload > maxLoad ? totalWorkload - maxLoad : 0;
                S4_total += S4_assignment;
            });
        }
        globalS2 += S2_total;
        globalS4 += S4_total;
        const S3_total = patientContinuityContributions[nurse.id] || 0;
        return {
            nurseId: nurse.id,
            S2: S2_total,
            S3: S3_total,
            S4: S4_total,
        };
    });

    // --- Aplicación de los pesos globales ---
    const globalS2Weighted = globalS2 * weights.room_nurse_skill;
    const globalS3Weighted =
        Object.values(patientContinuityContributions).reduce((sum, val) => sum + val, 0) *
        weights.continuity_of_care;
    const globalS4Weighted = globalS4 * weights.nurse_eccessive_workload;

    return {
        globalS2Weighted,
        globalS3Weighted,
        globalS4Weighted,
        nursePenalties,
    };
}