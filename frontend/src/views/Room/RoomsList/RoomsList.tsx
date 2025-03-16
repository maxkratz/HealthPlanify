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


    const { inputData, solutionData } = data;
    const globalS1Weighted = inputData?.weights.room_mixed_age
    const calculateGlobalS1AgeDifference = () => {
        if (!inputData || !solutionData) return 0;
        const { rooms, age_groups, patients, occupants, days } = inputData;
        let totalAgeDifference = 0;
        // Mapas para acceso rápido
        const patientAgeMap = new Map(patients.map(p => [p.id, p.age_group]));
        const occupantAgeMap = new Map(occupants.map(o => [o.id, o.age_group]));
        const patientStayMap = new Map(patients.map(p => [p.id, p.length_of_stay || 0])); // Acceso rápido a length_of_stay
        // Recorremos todas las habitaciones y días
        rooms.forEach(room => {
            for (let day = 0; day < days; day++) {
                // Obtener pacientes en la habitación ese día
                const patientsInRoom = solutionData.patients.filter(p =>
                    p.room === room.id &&
                    p.admission_day <= day &&
                    day < p.admission_day + (patientStayMap.get(p.id) ?? 0) // Acceso O(1)
                );
                // Obtener occupants en la habitación ese día
                const occupantsInRoom = occupants.filter(o =>
                    o.room_id === room.id && day < o.length_of_stay
                );
                // Obtener índices de edad para los pacientes en la habitación en este día
                const ageIndices = [...patientsInRoom, ...occupantsInRoom]
                    .map(person => {
                        const ageGroup = patientAgeMap.get(person.id) || occupantAgeMap.get(person.id);
                        return ageGroup ? age_groups.indexOf(ageGroup as AgeGroup) : -1;
                    })
                    .filter(index => index !== -1); // Filtrar valores inválidos
                // Calcular diferencia máxima de edad y acumularla
                if (ageIndices.length > 0) {
                    const minAge = Math.min(...ageIndices);
                    const maxAge = Math.max(...ageIndices);
                    totalAgeDifference += maxAge - minAge;
                }
            }
        });
        return totalAgeDifference * (globalS1Weighted ?? 1);
    };


    return (
        <div>
            <div className='mb-16'>
                <h1>Rooms List</h1>
            </div>

            <div className='mb-16'>
                <h2>Global Cost of Restriction</h2>
                <p>
                    <strong>S1 - Age Groups Difference</strong> (Weight: {globalS1Weighted}): {calculateGlobalS1AgeDifference()}
                </p>
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
