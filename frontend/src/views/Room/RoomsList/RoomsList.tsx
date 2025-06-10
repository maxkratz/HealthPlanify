import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Room } from '../../../components/Room/Room';
import { useData } from "../../../DataContext";
import { PatientFullData } from '../../../types/Combined';
import { AgeGroup } from '../../../types/types';
import { calculateGlobalS1AgeDifference } from '../../../utils/SoftConstraints/calculateGlobalS1AgeDifference';
import Elderly from '@mui/icons-material/Elderly';
import { SortButton } from '../../../components/SortButton';

type SortCriteria = 'roomId' | 'capacity' | 'ageDifference';

export const RoomsList: React.FC = () => {
    const { dayIndex } = useParams();
    const data = useData();
    const rooms = data.inputData?.rooms || [];
    const dayNumber = Number(dayIndex);

    const [sortCriteria, setSortCriteria] = useState<SortCriteria>('roomId');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');


    const { inputData, solutionData } = data;
    if (!inputData || !solutionData) {
        return <div>Ups, something went wrong! There is no loaded data</div>;
    }

    const handleSort = (criteria: SortCriteria) => {
        if (criteria === sortCriteria) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortCriteria(criteria);
            setSortDirection('asc');
        }
    };

    const roomsWithMetrics = rooms.map(room => {
        const patientsAssigned: PatientFullData[] = (solutionData.patients.filter(patient => {
            if (typeof patient.admission_day !== 'number') return false;
            const patientInput = inputData.patients.find(p => p.id === patient.id);
            if (!patientInput) return false;
            return (
                patient.room === room.id &&
                patient.admission_day <= dayNumber &&
                dayNumber < patient.admission_day + patientInput.length_of_stay
            );
        }) || []).map(patient => {
            const patientInput = inputData.patients.find(p => p.id === patient.id)!;
            return { ...patientInput, ...patient } as PatientFullData;
        });

        const occupantsAssigned = inputData.occupants.filter(
            occupant => occupant.room_id === room.id && dayNumber < occupant.length_of_stay
        );

        const ageGroupsOrdered = inputData.age_groups || [];
        const roomOccupants = [...patientsAssigned, ...occupantsAssigned];
        const ageIndices = roomOccupants.map(p => ageGroupsOrdered.indexOf(p.age_group as AgeGroup));
        const s1AgeDifference =
            ageIndices.length > 0 ? Math.max(...ageIndices) - Math.min(...ageIndices) : 0;

        return {
            ...room,
            patientsAssigned,
            occupantsAssigned,
            s1AgeDifference,
        };
    });

    const sortedRooms = [...roomsWithMetrics].sort((a, b) => {
        let diff = 0;
        if (sortCriteria === 'roomId') {
            diff = a.id.localeCompare(b.id);
        } else if (sortCriteria === 'capacity') {
            diff = a.capacity - b.capacity;
        } else if (sortCriteria === 'ageDifference') {
            diff = a.s1AgeDifference - b.s1AgeDifference;
        }
        return sortDirection === 'asc' ? diff : -diff;
    });

    const globalS1Weighted = inputData.weights.room_mixed_age;

    return (
        <div>
            <div className='mb-16'>
                <h1>Rooms List (day {dayNumber + 1})</h1>
            </div>

            <div className='mb-16'>
                <h2>Global Cost of Restriction</h2>
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <Elderly sx={{ color: 'var(--color-black)', fontSize: 24 }} />
                    <span>
                        <strong>S1 - Age Groups Difference</strong>
                    </span>{' '}
                    (Weight: {globalS1Weighted}): {calculateGlobalS1AgeDifference(inputData, solutionData)}
                </div>
            </div>

            <div className="mb-16 flex items-center justify-center flex-row gap-4">
                <SortButton
                    onClick={() => handleSort('roomId')}
                    active={sortCriteria === 'roomId'}
                    label="Sort by Room ID"
                    sortDirection={sortCriteria === 'roomId' ? sortDirection : 'asc'}
                />
                <SortButton
                    onClick={() => handleSort('capacity')}
                    active={sortCriteria === 'capacity'}
                    label="Sort by Capacity"
                    sortDirection={sortCriteria === 'capacity' ? sortDirection : 'asc'}
                />
                <SortButton
                    onClick={() => handleSort('ageDifference')}
                    active={sortCriteria === 'ageDifference'}
                    label="Sort by Age Difference"
                    sortDirection={sortCriteria === 'ageDifference' ? sortDirection : 'asc'}
                />
            </div>

            <div className="flex items-center justify-center flex-row flex-wrap gap-4">
                {sortedRooms.map(room => (
                    <Room
                        key={room.id}
                        roomId={room.id}
                        capacity={room.capacity}
                        patients={room.patientsAssigned}
                        occupants={room.occupantsAssigned}
                        s1AgeDifference={room.s1AgeDifference}
                    />
                ))}
            </div>
        </div>
    );
};