import React from 'react';
import { useData } from '../../../DataContext';
import RoomCell from '../RoomCell/RoomCell';
import { PatientOutput } from '../../../types/SolutionFile';
import { PatientFullData } from '../../../types/Combined';
import { checkHardConstraints } from '../../../utils/checkHardConstraints';
import solutionGridStyles from './SolutionGrid.module.scss';

interface SolutionGridProps {
    onPatientClick: (patientId: string) => void;
    onDayClick: (day: number) => void;
}

export const SolutionGrid: React.FC<SolutionGridProps> = ({ onPatientClick, onDayClick }) => {
    const { inputData, solutionData, setSolutionData } = useData();
    const [errorMessages, setErrorMessages] = React.useState<string[]>([]);

    if (!inputData || !solutionData) {
        return <div>Ups, something went wrong! There is no loaded data</div>;
    }

    const days = inputData.days;
    const rooms = inputData.rooms;

    const gridData: { [day: number]: { [roomId: string]: PatientFullData[] } } = {};
    for (let d = 0; d < days; d++) {
        gridData[d] = {};
        rooms.forEach((room) => {
            gridData[d][room.id] = [];
        });
    }

    solutionData.patients.forEach((patientOutput) => {
        if (patientOutput.admission_day !== "none") {
            const patientInput = inputData.patients.find((pi) => pi.id === patientOutput.id)!;
            const patientFull: PatientFullData = { ...patientOutput, ...patientInput };
            gridData[patientOutput.admission_day][patientOutput.room].push(patientFull);
        }
    });

    const handleDropPatient = (patientId: string, newDay: number, newRoom: string) => {
        const updatedPatients = solutionData.patients.map((patient: PatientOutput) => {
            if (patient.id === patientId) {
                return { ...patient, admission_day: newDay, room: newRoom };
            }
            return patient;
        });
        const errors = checkHardConstraints(inputData, { ...solutionData, patients: updatedPatients });
        if (errors.length > 0) {
            setErrorMessages(errors);
            return;
        }
        setErrorMessages([]);
        setSolutionData({ ...solutionData, patients: updatedPatients });
    };

    return (
        <div>
            {errorMessages.length > 0 && (
                <div className="mb-16">
                    {errorMessages.map((msg, index) => (
                        <p key={index} className={solutionGridStyles.error_messages}>
                            {msg}
                        </p>
                    ))}
                </div>
            )}
            <div className="flex flex-col">
                <div className="flex flex-row gap-8.5 items-center">
                    {/* Celda vacía para alinear con el room.id */}
                    <div className="w-4"></div>
                    {Array.from({ length: days }).map((_, day) => (
                        <div key={day} className="min-w-[45px]">
                            <span onClick={() => onDayClick(day)}>Day {day}</span>
                        </div>
                    ))}
                </div>
                {rooms.map((room) => (
                    <div key={room.id} className="flex flex-row m-1 items-center">
                        <span className="w-4">{room.id}</span>
                        {Array.from({ length: days }).map((_, day) => (
                            <div key={day} className="m-1">
                                <RoomCell
                                    day={day}
                                    roomId={room.id}
                                    capacity={room.capacity}
                                    patients={gridData[day][room.id]}
                                    onDropPatient={handleDropPatient}
                                    onPatientClick={onPatientClick}
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
