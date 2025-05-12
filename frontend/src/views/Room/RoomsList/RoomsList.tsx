import React from 'react';
import { useParams } from 'react-router-dom';
import { Room } from '../../../components/Room/Room';
import { useData } from "../../../DataContext";
import { PatientFullData } from '../../../types/Combined';
import { AgeGroup } from '../../../types/types';
import { calculateGlobalS1AgeDifference } from '../../../utils/SoftConstraints/calculateGlobalS1AgeDifference';
import Elderly from '@mui/icons-material/Elderly';

export const RoomsList: React.FC = () => {
    const { dayIndex } = useParams();
    const data = useData();
    const rooms = data.inputData?.rooms || [];
    const dayNumber = Number(dayIndex);


    const { inputData, solutionData } = data;
    if (!inputData || !solutionData) {
        return <div>Ups, something went wrong! There is no loaded data</div>;
    }

    const globalS1Weighted = inputData?.weights.room_mixed_age

    return (
        <div>
            <div className='mb-16'>
                <h1>Rooms List</h1>
            </div>

            <div className='mb-16'>
                <h2>Global Cost of Restriction</h2>
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <Elderly sx={{ color: 'var(--color-black)', fontSize: 24 }} />
                    <span><strong>S1 - Age Groups Difference</strong></span> (Weight: {globalS1Weighted}): {calculateGlobalS1AgeDifference(inputData, solutionData)}
                </div>
            </div>

            <div className="flex items-center justify-center flex-row flex-wrap gap-4">
                {rooms.map((room) => {
                    const patientsAssigned: PatientFullData[] = (data.solutionData?.patients.filter((patient) => {
                        if (typeof patient.admission_day !== 'number') return false;
                        const patientInput = data.inputData?.patients.find(p => p.id === patient.id);
                        if (!patientInput) return false;
                        return (
                            patient.room === room.id &&
                            patient.admission_day <= dayNumber &&
                            dayNumber < patient.admission_day + patientInput.length_of_stay
                        );
                    }) || []).map((patient) => {
                        const patientInput = data.inputData?.patients.find(p => p.id === patient.id);
                        return { ...patientInput, ...patient } as PatientFullData;
                    });

                    const occupantsAssigned = data.inputData?.occupants.filter(
                        (occupant) =>
                            occupant.room_id === room.id &&
                            dayNumber < occupant.length_of_stay
                    ) || [];


                    // Cálculo de la restricción S1: Diferencia máxima entre grupos de edad
                    const ageGroupsOrdered = data.inputData?.age_groups || [];
                    const roomOccupants = [
                        ...patientsAssigned,
                        ...occupantsAssigned
                    ];
                    const ageIndices = roomOccupants.map(person => ageGroupsOrdered.indexOf(person.age_group as AgeGroup));
                    const s1AgeDifference = ageIndices.length > 0
                        ? Math.max(...ageIndices) - Math.min(...ageIndices)
                        : 0;

                    return (
                        <Room
                            key={room.id}
                            roomId={room.id}
                            capacity={room.capacity}
                            patients={patientsAssigned}
                            occupants={occupantsAssigned}
                            s1AgeDifference={s1AgeDifference}
                        />
                    );
                })}
            </div>
        </div>
    );
};
