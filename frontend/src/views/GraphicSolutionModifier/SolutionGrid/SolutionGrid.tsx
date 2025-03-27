import React from 'react';
import { useData } from '../../../DataContext';
import RoomCell from '../RoomCell/RoomCell';
import { PatientOutput } from '../../../types/SolutionFile'
import { checkHardConstraints } from '../../../utils/checkHardConstraints';

export const SolutionGrid: React.FC = () => {
    const { inputData, solutionData, setSolutionData } = useData();

    if (!inputData || !solutionData) {
        return <div>Ups, something went wrong! There is no loaded data</div>;
    }

    const days = inputData.days;
    const rooms = inputData.rooms;

    // Creamos una estructura para agrupar pacientes por día y sala
    const gridData: { [day: number]: { [roomId: string]: PatientOutput[] } } = {};
    for (let d = 0; d < days; d++) {
        gridData[d] = {};
        rooms.forEach((room) => {
            gridData[d][room.id] = [];
        });
    }

    solutionData.patients.forEach((patient) => {
        if (patient.admission_day !== "none") {
            gridData[patient.admission_day][patient.room].push(patient);
        }
    });

    const handleDropPatient = (patientId: string, newDay: number, newRoom: string) => {
        const updatedPatients = solutionData.patients.map((patient) => {
            if (patient.id === patientId) {
                return { ...patient, admission_day: newDay, room: newRoom };
            }
            return patient;
        });
        const errors = checkHardConstraints(inputData, { ...solutionData, patients: updatedPatients });
        if (errors.length > 0) {
            console.log(errors);
            return;
        }
        setSolutionData({ ...solutionData, patients: updatedPatients });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            {Array.from({ length: days }).map((_, day) => (
                <div key={day} style={{ margin: '10px' }}>
                    <h3>Day {day}</h3>
                    {rooms.map((room) => (
                        <div key={room.id} style={{ marginBottom: '10px' }}>
                            <h4>{room.id}</h4>
                            <RoomCell
                                day={day}
                                roomId={room.id}
                                patients={gridData[day][room.id]}
                                onDropPatient={handleDropPatient}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};