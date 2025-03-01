import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Room } from '../../components/Room/Room';
import { useData } from "../../DataContext";

export const Rooms: React.FC = () => {
    const { branch, dayIndex } = useParams();
    const data = useData();
    const rooms = data.inputData?.rooms || [];
    const dayNumber = Number(dayIndex);

    return (
        <div className="flex flex-row gap-4">
            {rooms.map((room) => {
                // Filtrar los pacientes asignados a esta sala que ya han sido admitidos a partir de dayNumber
                const patientsAssigned = data.solutionData?.patients.filter(
                    (patient) =>
                        patient.room === room.id &&
                        patient.admission_day <= dayNumber
                ) || [];

                // Filtrar los occupants asignados a esta sala
                const occupantsAssigned = data.inputData?.occupants.filter(
                    (occupant) => occupant.room_id === room.id
                ) || [];

                return (
                    <Link key={room.id} to={`/FirstElection/${branch}/Calendar/${dayIndex}/Rooms/${room.id}`}>
                        <Room
                            roomId={room.id}
                            capacity={room.capacity}
                            patients={patientsAssigned}
                            occupants={occupantsAssigned}
                        />
                    </Link>
                );
            })}
        </div>
    );
};
