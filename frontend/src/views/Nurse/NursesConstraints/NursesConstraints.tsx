import React from 'react';
import { NurseConstraint } from '../../../components/NurseConstraint';
import { useData } from "../../../DataContext";
import { PatientFullData } from '../../../types/Combined';

type ConstraintPatient = {
    patientId: string;
    workload: number;
    requiredSkill: number;
};

export const NursesConstraints: React.FC = () => {
    const data = useData();

    if (!data.inputData || !data.solutionData) {
        return <div>Loading...</div>;
    }

    const { weights } = data.inputData;

    // Cálculo S3: Continuity of care
    const patientContinuityContributions: Record<string, number> = {};
    data.inputData.nurses.forEach(nurse => {
        patientContinuityContributions[nurse.id] = 0;
    });
    (data.solutionData.patients || []).forEach(patient => {
        if (typeof patient.admission_day !== 'number') return;
        const inputPatient = data.inputData?.patients.find(p => p.id === patient.id);
        if (!inputPatient) return;
        const admissionDay = patient.admission_day;
        const dischargeDay = admissionDay + inputPatient.length_of_stay;
        const nurseSet = new Set<string>();
        (data.solutionData?.nurses || []).forEach(nurseSol => {
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
    (data.inputData.occupants || []).forEach(occupant => {
        const admissionDay = 0;
        const dischargeDay = occupant.length_of_stay;
        const nurseSet = new Set<string>();
        (data.solutionData?.nurses || []).forEach(nurseSol => {
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


    // Preparación de la lista completa de pacientes para S2 y S4
    const allPatients = [
        ...(data.solutionData.patients || []),
        ...((data.inputData.occupants || []).map(occ => ({
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

    // Para cada enfermera, se recorren todas sus asignaciones en la solución para calcular S2 y S4
    const nursePenalties = data.inputData.nurses.map(nurse => {
        let S2_total = 0;
        let S4_total = 0;
        const nurseSolution = data.solutionData?.nurses.find(n => n.id === nurse.id);
        if (nurseSolution) {
            nurseSolution.assignments.forEach(assignment => {
                const currentDay = assignment.day;
                const currentShift = assignment.shift;
                // Se busca la información del turno en los datos de entrada de la enfermera para obtener el max_load
                const workingShift = nurse.working_shifts.find(ws => ws.day === currentDay && ws.shift === currentShift);
                const maxLoad = workingShift ? workingShift.max_load : 0;

                // Se filtran los pacientes asignados en esta asignación de la lista completa (programados y occupants)
                const assignedPatients: ConstraintPatient[] = allPatients
                    .filter(patient => {
                        // Para los pacientes programados, patient.admission_day está definido.
                        // Para occupants, hemos fijado admission_day = 0.
                        if (typeof patient.admission_day !== 'number') return false;
                        if (patient.admission_day > currentDay) return false;
                        const inputPatient = (data.inputData?.patients.find(p => p.id === patient.id) ||
                            // Si no se encuentra en los pacientes programados, se asume que es un occupant (ya transformado)
                            patient) as PatientFullData;
                        if (!inputPatient) return false;
                        if (currentDay >= patient.admission_day + inputPatient.length_of_stay) return false;
                        return assignment.rooms.includes(patient.room);
                    })
                    .map(patient => {
                        const inputPatient = (data.inputData?.patients.find(p => p.id === patient.id) ||
                            // Para occupants, usamos el propio objeto transformado
                            patient) as PatientFullData;
                        if (!inputPatient) return null;
                        // Se calcula el índice del turno: (currentDay - admission_day) * 3 + (índice del turno)
                        const shiftOrder: Record<string, number> = { early: 0, late: 1, night: 2 };
                        const shiftOrdinal = shiftOrder[currentShift];
                        const dayOffset = currentDay - patient.admission_day;
                        const shiftIndex = dayOffset * 3 + shiftOrdinal;
                        const requiredSkill = inputPatient.skill_level_required[shiftIndex] ?? 0;
                        const workload = inputPatient.workload_produced[shiftIndex] ?? 0;
                        return { patientId: patient.id, workload, requiredSkill } as ConstraintPatient;
                    })
                    .filter(Boolean) as ConstraintPatient[];

                // S2: Por cada paciente, si la enfermera no alcanza el nivel requerido, se suma la diferencia
                const S2_assignment = assignedPatients.reduce(
                    (sum, p) => sum + Math.max(0, p.requiredSkill - nurse.skill_level),
                    0
                );
                S2_total += S2_assignment;

                // S4: Se suma el workload total y, si supera el max_load, se suma la diferencia
                const totalWorkload = assignedPatients.reduce((sum, p) => sum + p.workload, 0);
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

    const globalS2Weighted = globalS2 * weights.room_nurse_skill;
    const globalS3Weighted = Object.values(patientContinuityContributions).reduce((sum, val) => sum + val, 0) * weights.continuity_of_care;
    const globalS4Weighted = globalS4 * weights.nurse_eccessive_workload;

    return (
        <div>
            <div className='mb-16'>
                <h1>Nurses Contraints</h1>
            </div>

            <div className='mb-16'>
                <h2>Global Costs of Restrictions</h2>
                <p>
                    <strong>S2 - Minimum Skill Level</strong> (Weight: {weights.room_nurse_skill}): {globalS2Weighted}
                </p>
                <p>
                    <strong>S3 - Continuity of Care</strong> (Weight: {weights.continuity_of_care}): {globalS3Weighted}
                </p>
                <p>
                    <strong>S4 - Maximum Workload</strong> (Weight: {weights.nurse_eccessive_workload}): {globalS4Weighted}
                </p>
            </div>

            <div className="flex items-center justify-center flex-row flex-wrap gap-4">
                {nursePenalties.map(({ nurseId, S2, S3, S4 }) => (
                    <NurseConstraint
                        key={nurseId}
                        nurseId={nurseId}
                        s2MinimumSkillLevel={S2 * weights.room_nurse_skill}
                        s3CareContinuity={S3 * weights.continuity_of_care}
                        s4MaximumWorkload={S4 * weights.nurse_eccessive_workload}
                    />
                ))}
            </div>
        </div>
    );
};

export default NursesConstraints;
