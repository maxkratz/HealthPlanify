import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Nurse } from '../../../components/Nurse/Nurse';
import { useData } from "../../../DataContext";
import { FlagBanner } from 'phosphor-react';
import { SortButton } from '../../../components/SortButton';

export type AssignedPatient = {
    patientId: string;
    workload: number;
    requiredSkill: number;
};

type SortCriteria = 'id' | 'skillDiff' | 'maxLoad';

export const NursesList: React.FC = () => {
    const { dayIndex, shiftType } = useParams<{ branch: string, dayIndex: string, shiftType: string }>();
    const data = useData();
    const dayNumber = Number(dayIndex);

    const [sortCriteria, setSortCriteria] = useState<SortCriteria>('id');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const handleSort = (criteria: SortCriteria) => {
        if (criteria === sortCriteria) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortCriteria(criteria);
            setSortDirection(criteria === 'id' ? 'asc' : 'desc');
        }
    };

    const shiftOrder: Record<string, number> = { early: 0, late: 1, night: 2 };

    const availableNurses = data.inputData?.nurses.filter(nurse =>
        nurse.working_shifts.some(ws => ws.day === dayNumber && ws.shift === shiftType)
    ) || [];

    const nursesWithData = availableNurses.map(nurse => {
        const { skill_level: skillLevel } = nurse;
        const workingShift = nurse.working_shifts.find(ws => ws.day === dayNumber && ws.shift === shiftType);
        const maxLoad = workingShift ? workingShift.max_load : 0;
        const nurseSolution = data.solutionData?.nurses.find(n => n.id === nurse.id);
        const assignment = nurseSolution?.assignments.find(a => a.day === dayNumber && a.shift === shiftType);
        const assignedRooms = assignment ? assignment.rooms : [];

        const assignedPatients = (data.solutionData?.patients || []).filter(patient => {
            if (typeof patient.admission_day !== 'number') return false;
            if (patient.admission_day > dayNumber) return false;
            const inputPatient = data.inputData?.patients.find(p => p.id === patient.id);
            if (!inputPatient) return false;
            if (dayNumber >= patient.admission_day + inputPatient.length_of_stay) return false;
            return assignedRooms.includes(patient.room);
        }).map(patient => {
            const inputPatient = data.inputData?.patients.find(p => p.id === patient.id);
            if (!inputPatient) return null;
            const shiftOrdinal = shiftOrder[shiftType!] ?? 0;
            const dayOffset = dayNumber - (patient.admission_day as number);
            const shiftIndex = dayOffset * 3 + shiftOrdinal;
            return {
                patientId: patient.id,
                workload: inputPatient.workload_produced[shiftIndex] ?? 0,
                requiredSkill: inputPatient.skill_level_required[shiftIndex] ?? 0
            } as AssignedPatient;
        }).filter(Boolean) as AssignedPatient[];

        const maxRequiredSkill = assignedPatients.reduce((max, p) => p.requiredSkill > max ? p.requiredSkill : max, 0);
        const skillDiff = maxRequiredSkill - skillLevel;

        return { nurse, maxLoad, assignedPatients, assignedRooms, skillDiff };
    });

    const sortedNurses = [...nursesWithData].sort((a, b) => {
        let diff = 0;
        if (sortCriteria === 'id') {
            diff = a.nurse.id.localeCompare(b.nurse.id);
        } else if (sortCriteria === 'skillDiff') {
            diff = a.skillDiff - b.skillDiff;
        } else if (sortCriteria === 'maxLoad') {
            diff = a.maxLoad - b.maxLoad;
        }
        return sortDirection === 'asc' ? diff : -diff;
    });

    return (
        <div>
            <div className='mb-16'>
                <h1>Nurses List (day {dayNumber}, shift {shiftType})</h1>
            </div>

            <div className='mb-16'>
                <h2>Global Cost of Restriction</h2>
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <FlagBanner size={24} weight="fill" color="var(--color-black)" />
                    <span><strong>S2 - Minimum Skill Level</strong></span>
                </div>
            </div>

            <div className="mb-16 flex items-center justify-center flex-row gap-4">
                <SortButton
                    onClick={() => handleSort('id')}
                    active={sortCriteria === 'id'}
                    label="Sort by ID"
                    sortDirection={sortCriteria === 'id' ? sortDirection : 'asc'}
                />
                <SortButton
                    onClick={() => handleSort('skillDiff')}
                    active={sortCriteria === 'skillDiff'}
                    label="Sort by Skill Diff"
                    sortDirection={sortCriteria === 'skillDiff' ? sortDirection : 'desc'}
                />
                <SortButton
                    onClick={() => handleSort('maxLoad')}
                    active={sortCriteria === 'maxLoad'}
                    label="Sort by Max Load"
                    sortDirection={sortCriteria === 'maxLoad' ? sortDirection : 'desc'}
                />
            </div>

            <div className="flex items-center justify-center flex-row flex-wrap gap-4">
                {sortedNurses.map(({ nurse, maxLoad, assignedPatients, assignedRooms }) => (
                    <Nurse
                        key={nurse.id}
                        nurseId={nurse.id}
                        skillLevel={nurse.skill_level}
                        maxLoad={maxLoad}
                        assignedPatients={assignedPatients}
                        assignedRooms={assignedRooms}
                    />
                ))}
            </div>
        </div>
    );
};