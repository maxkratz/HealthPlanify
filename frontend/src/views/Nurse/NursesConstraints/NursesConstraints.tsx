import React, { useState } from 'react';
import { NurseConstraint } from '../../../components/NurseConstraint';
import { useData } from "../../../DataContext";
import { PatientFullData } from '../../../types/Combined';
import { SortButton } from '../../../components/SortButton';
import { FlagBanner, Heart, BatteryFull } from 'phosphor-react';

type ConstraintPatient = {
    patientId: string;
    workload: number;
    requiredSkill: number;
};

export const NursesConstraints: React.FC = () => {
    const data = useData();
    const [sortCriteria, setSortCriteria] = useState<"S2" | "S3" | "S4" | "total">("total");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const handleSort = (criteria: "S2" | "S3" | "S4" | "total") => {
        if (criteria === sortCriteria) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortCriteria(criteria);
            setSortDirection("desc");
        }
    };


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

    // Se calculan los penalizadores para cada enfermera
    const nursePenalties = data.inputData.nurses.map(nurse => {
        let S2_total = 0;
        let S4_total = 0;
        const nurseSolution = data.solutionData?.nurses.find(n => n.id === nurse.id);
        if (nurseSolution) {
            nurseSolution.assignments.forEach(assignment => {
                const currentDay = assignment.day;
                const currentShift = assignment.shift;
                const workingShift = nurse.working_shifts.find(ws => ws.day === currentDay && ws.shift === currentShift);
                const maxLoad = workingShift ? workingShift.max_load : 0;

                const assignedPatients: ConstraintPatient[] = allPatients
                    .filter(patient => {
                        if (typeof patient.admission_day !== 'number') return false;
                        if (patient.admission_day > currentDay) return false;
                        const inputPatient = (data.inputData?.patients.find(p => p.id === patient.id) || patient) as PatientFullData;
                        if (!inputPatient) return false;
                        if (currentDay >= patient.admission_day + inputPatient.length_of_stay) return false;
                        return assignment.rooms.includes(patient.room);
                    })
                    .map(patient => {
                        const inputPatient = (data.inputData?.patients.find(p => p.id === patient.id) || patient) as PatientFullData;
                        if (!inputPatient) return null;
                        const shiftOrder: Record<string, number> = { early: 0, late: 1, night: 2 };
                        const shiftOrdinal = shiftOrder[currentShift];
                        if (typeof patient.admission_day !== 'number') return false;
                        const dayOffset = currentDay - patient.admission_day;
                        const shiftIndex = dayOffset * 3 + shiftOrdinal;
                        const requiredSkill = inputPatient.skill_level_required[shiftIndex] ?? 0;
                        const workload = inputPatient.workload_produced[shiftIndex] ?? 0;
                        return { patientId: patient.id, workload, requiredSkill } as ConstraintPatient;
                    })
                    .filter(Boolean) as ConstraintPatient[];

                // S2: penalización si la enfermera no alcanza el nivel requerido
                const S2_assignment = assignedPatients.reduce(
                    (sum, p) => sum + Math.max(0, p.requiredSkill - nurse.skill_level),
                    0
                );
                S2_total += S2_assignment;

                // S4: penalización si el workload supera el máximo permitido
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

    const sortedNursePenalties = [...nursePenalties].sort((a, b) => {
        let diff = 0;
        if (sortCriteria === 'S2') {
            diff = a.S2 - b.S2;
        } else if (sortCriteria === 'S3') {
            diff = a.S3 - b.S3;
        } else if (sortCriteria === 'S4') {
            diff = a.S4 - b.S4;
        } else {
            diff = (a.S2 + a.S3 + a.S4) - (b.S2 + b.S3 + b.S4);
        }
        return sortDirection === 'asc' ? diff : -diff;
    });

    const maxTotal = Math.max(...nursePenalties.map(nurse => nurse.S2 + nurse.S3 + nurse.S4));

    return (
        <div>
            <div className='mb-16'>
                <h1>Nurses Contraints</h1>
            </div>

            <div className='mb-16'>
                <h2>Global Costs of Restrictions</h2>
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <FlagBanner size={24} weight="fill" color="var(--color-icon-flagBanner)" />
                    <span>
                        <strong>S2 - Minimum Skill Level</strong>
                    </span> (Weight: {weights.room_nurse_skill}): {globalS2Weighted}
                </div>
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <Heart size={24} weight="fill" color="var(--color-icon-heart)" />
                    <span>
                        <strong>S3 - Continuity of Care</strong>
                    </span> (Weight: {weights.continuity_of_care}): {globalS3Weighted}
                </div>
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <BatteryFull size={24} weight="fill" color="var(--color-icon-batteryFull)" />
                    <span>
                        <strong>S4 - Maximum Workload</strong>
                    </span> (Weight: {weights.nurse_eccessive_workload}): {globalS4Weighted}
                </div>
            </div>

            <div className="mb-16 flex items-center justify-center flex-row gap-4">
                <SortButton
                    onClick={() => handleSort("total")}
                    active={sortCriteria === "total"}
                    label="Sort by Total"
                    sortDirection={sortCriteria === "total" ? sortDirection : undefined}
                />
                <SortButton
                    onClick={() => handleSort("S2")}
                    active={sortCriteria === "S2"}
                    icon={<FlagBanner size={20} weight="fill" color="var(--color-icon-flagBanner)" />}
                    label="Sort by S2"
                    sortDirection={sortCriteria === "S2" ? sortDirection : undefined}
                />
                <SortButton
                    onClick={() => handleSort("S3")}
                    active={sortCriteria === "S3"}
                    icon={<Heart size={20} weight="fill" color="var(--color-icon-heart)" />}
                    label="Sort by S3"
                    sortDirection={sortCriteria === "S3" ? sortDirection : undefined}
                />
                <SortButton
                    onClick={() => handleSort("S4")}
                    active={sortCriteria === "S4"}
                    icon={<BatteryFull size={20} weight="fill" color="var(--color-icon-batteryFull)" />}
                    label="Sort by S4"
                    sortDirection={sortCriteria === "S4" ? sortDirection : undefined}
                />
            </div>


            <div className="flex items-center justify-center flex-row flex-wrap gap-4">
                {sortedNursePenalties.map(({ nurseId, S2, S3, S4 }) => (
                    <NurseConstraint
                        key={nurseId}
                        nurseId={nurseId}
                        s2MinimumSkillLevel={S2}
                        s3CareContinuity={S3}
                        s4MaximumWorkload={S4}
                        maxTotal={maxTotal}
                    />
                ))}
            </div>
        </div>
    );
};

export default NursesConstraints;
