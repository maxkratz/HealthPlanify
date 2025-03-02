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
                // Filtrar pacientes asignados a esta sala que estén admitidos y aún se encuentren
                // en el hospital, usando length_of_stay del input. Se asume que en el archivo de solución
                // el paciente solo tiene admission_day, por lo que se consulta el input para obtener length_of_stay.
                const patientsAssigned = data.solutionData?.patients.filter((patient) => {
                    // Buscar el paciente en el input para obtener el length_of_stay
                    const patientInput = data.inputData?.patients.find(p => p.id === patient.id);
                    if (!patientInput) return false;
                    return (
                        patient.room === room.id &&
                        patient.admission_day <= dayNumber &&
                        dayNumber < patient.admission_day + patientInput.length_of_stay
                    );
                }) || [];

                // Filtrar occupants asignados a esta sala. Se asume que su admisión es el día 0.
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
