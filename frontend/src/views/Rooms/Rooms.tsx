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
        <div className="flex flex-row flex-wrap m-4 gap-4">
            {rooms.map((room) => {
                const patientsAssigned = data.solutionData?.patients.filter((patient) => {
                    const patientInput = data.inputData?.patients.find(p => p.id === patient.id);
                    if (!patientInput) return false;
                    return (
                        patient.room === room.id &&
                        patient.admission_day <= dayNumber &&
                        dayNumber < patient.admission_day + patientInput.length_of_stay
                    );
                }) || [];

                const occupantsAssigned = data.inputData?.occupants.filter(
                    (occupant) =>
                        occupant.room_id === room.id &&
                        dayNumber < occupant.length_of_stay
                ) || [];

                const roomData = {
                    roomId: room.id,
                    capacity: room.capacity,
                    patients: patientsAssigned,
                    occupants: occupantsAssigned,
                };

                return (
                    <Link
                        key={room.id}
                        to={`/FirstElection/${branch}/Calendar/${dayIndex}/Rooms/${room.id}`}
                        state={{ roomData }}
                    >
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
