import React from 'react';
import { useLocation } from 'react-router-dom';
import { PatientOutput } from '../../types/SolutionFile';
import { Occupant } from '../../types/InputFile';

export const RoomDetails: React.FC = () => {
    const location = useLocation();
    const roomData = location.state?.roomData;

    if (!roomData) {
        return <div>No hay datos para esta sala.</div>;
    }

    return (
        <div>
            <h1>Detalles de la Sala: {roomData.roomId}</h1>
            <p><strong>Capacidad:</strong> {roomData.capacity}</p>
            <p>
                <strong>Pacientes Asignados:</strong> {roomData.patients.length}
            </p>
            <p>
                <strong>Ocupantes:</strong> {roomData.occupants.length}
            </p>

            <section>
                <h2>Listado de Pacientes</h2>
                {roomData.patients.length === 0 ? (
                    <p>No hay pacientes asignados.</p>
                ) : (
                    <ul>
                        {roomData.patients.map((patient: PatientOutput) => (
                            <li key={patient.id}>
                                <strong>ID:</strong> {patient.id} - <strong>Día de admisión:</strong> {patient.admission_day}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2>Listado de Ocupantes</h2>
                {roomData.occupants.length === 0 ? (
                    <p>No hay occupants asignados.</p>
                ) : (
                    <ul>
                        {roomData.occupants.map((occupant: Occupant) => (
                            <li key={occupant.id}>
                                <strong>ID:</strong> {occupant.id} - <strong>Género:</strong> {occupant.gender} - <strong>Grupo de edad:</strong> {occupant.age_group}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};
