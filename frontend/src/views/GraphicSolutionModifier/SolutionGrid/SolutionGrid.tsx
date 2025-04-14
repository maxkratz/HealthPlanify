import React from 'react';
import { useData } from '../../../DataContext';
import RoomCell from '../RoomCell/RoomCell';
import { PatientOutput } from '../../../types/SolutionFile';
import { PatientFullData } from '../../../types/Combined';
import { Occupant } from '../../../types/InputFile';
import { checkHardConstraints } from '../../../utils/checkHardConstraints';
import solutionGridStyles from './SolutionGrid.module.scss';

export type RoomPerson =
    | (PatientFullData & { roomOccupantType: "admission" | "ongoing" })
    | (Occupant & { roomOccupantType: "occupant" });

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


    const gridData: { [day: number]: { [roomId: string]: RoomPerson[] } } = {};
    for (let d = 0; d < days; d++) {
        gridData[d] = {};
        rooms.forEach((room) => {
            gridData[d][room.id] = [];

            const patientsAssigned: RoomPerson[] = (solutionData.patients.filter((patientOutput) => {
                if (patientOutput.admission_day === "none") return false;
                const patientInput = inputData.patients.find((pi) => pi.id === patientOutput.id);
                if (!patientInput) return false;
                return (
                    patientOutput.room === room.id &&
                    d >= patientOutput.admission_day &&
                    d < patientOutput.admission_day + patientInput.length_of_stay
                );
            }) || []).map((p) => {
                const patientInput = inputData.patients.find((pi) => pi.id === p.id)!;
                const roomOccupantType: "admission" | "ongoing" = d === p.admission_day ? "admission" : "ongoing";
                return { ...patientInput, ...p, roomOccupantType } as PatientFullData & { roomOccupantType: "admission" | "ongoing" };
            });

            const occupantsAssigned: RoomPerson[] = (inputData.occupants.filter(
                (occupant) => occupant.room_id === room.id && d < occupant.length_of_stay
            ) || []).map((occ) => ({
                ...occ,
                roomOccupantType: "occupant" as const
            }));

            gridData[d][room.id] = patientsAssigned.concat(occupantsAssigned);
        });
    }

    const unscheduledPatients: RoomPerson[] = solutionData.patients
        .filter((patient) => patient.admission_day === "none")
        .map((p) => {
            const patientInput = inputData.patients.find((pi) => pi.id === p.id);
            if (patientInput) {
                return { ...patientInput, ...p, roomOccupantType: "admission" } as RoomPerson;
            }
            return { ...p, roomOccupantType: "admission" } as RoomPerson;
        });


    const handleDropPatient = (patientId: string, newDay: number | "none", newRoom: string) => {
        console.log("Dropped patient", patientId, "on day", newDay, "in room", newRoom);
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


            <div className="flex flex-row">
                <div className="flex flex-col">
                    <div className="flex flex-row gap-2 items-center">
                        <div className="min-w-[2rem]"></div>
                        {Array.from({ length: days }).map((_, day) => (
                            <div key={day} className="min-w-[5.167rem]">
                                <span onClick={() => onDayClick(day)} style={{ cursor: 'pointer' }}>
                                    Day {day}
                                </span>
                            </div>
                        ))}
                    </div>
                    {rooms.map((room) => (
                        <div key={room.id} className="flex flex-row m-1 items-center">
                            <span className="min-w-[2rem]">{room.id}</span>
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


                <div className="flex flex-col ml-4">
                    <div className="flex flex-row gap-2 items-center">
                        <div className="min-w-[2rem]"></div>
                        <div className="min-w-[5.167rem]">
                            <span>Unscheduled</span>
                        </div>
                    </div>
                    <div className="flex flex-row m-1 items-center">
                        <span className="min-w-[2rem]"></span>
                        <div className="m-1">
                            <RoomCell
                                day={"none"}
                                roomId="unscheduled"
                                capacity={100}
                                patients={unscheduledPatients}
                                onDropPatient={(patientId, newDay, newRoom) => {
                                    handleDropPatient(patientId, "none", "");
                                }}
                                onPatientClick={onPatientClick}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
