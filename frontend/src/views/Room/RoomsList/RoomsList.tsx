import React from 'react';
import { useParams } from 'react-router-dom';
import { Room } from '../../../components/Room/Room';
import { useData } from "../../../DataContext";
import { PatientFullData } from '../../../types/Combined';
import { AgeGroup } from '../../../types/types';

export const RoomsList: React.FC = () => {
    const { dayIndex } = useParams();
    const data = useData();
    const rooms = data.inputData?.rooms || [];
    const dayNumber = Number(dayIndex);

    return (
        <div>
            <div className='mb-16'>
                <h1>Rooms List</h1>
            </div>
            <div className="flex items-center justify-center flex-row flex-wrap gap-4">

                {rooms.map((room) => {
                    const patientsAssigned: PatientFullData[] = (data.solutionData?.patients.filter((patient) => {
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
                    // Se asume que el array de age_groups en inputData está ordenado
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
