import React from 'react';
import { useData } from '../../../DataContext';
import RoomCell from '../RoomCell/RoomCell';
import { PatientOutput } from '../../../types/SolutionFile';
import { PatientFullData } from '../../../types/Combined';
import { Occupant } from '../../../types/InputFile';
import { checkHardConstraints } from '../../../utils/checkHardConstraints';
import { PatientDetail } from '../PatientDetail/PatientDetail';
import { DayDetail } from '../DayDetail/DayDetail';
import { Legend } from '../Legend/Legend';
import solutionGridStyles from './PatientScheduler.module.scss';
import { checkSoftConstraintsCost } from '../../../utils/checkSoftConstraints';

export type RoomPerson =
    | (PatientFullData & { roomOccupantType: "admission" | "ongoing" })
    | (Occupant & { roomOccupantType: "occupant" });

interface PatientDelta {
    patientId: string;
    previousAdmissionDay: number | "none";
    previousRoom: string;
}

export const PatientScheduler = () => {
    const { inputData, solutionData, setSolutionData } = useData();
    const [selectedOperatingTheater, setSelectedOperatingTheater] = React.useState<string>("no-change");
    const [selectedPatientId, setSelectedPatientId] = React.useState<string | null>(inputData?.patients[0]?.id || null);
    const [selectedDay, setSelectedDay] = React.useState<number | null>(0);
    const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
    const MAX_HISTORY = 10;

    const [deltaHistory, setDeltaHistory] = React.useState<PatientDelta[]>(() => {
        const persistedDeltas = localStorage.getItem('deltaHistory');
        if (persistedDeltas) {
            try {
                return JSON.parse(persistedDeltas);
            } catch (error) {
                console.error('Error al parsear el historial persistido de deltas', error);
            }
        }
        return [];
    });

    React.useEffect(() => {
        localStorage.setItem('deltaHistory', JSON.stringify(deltaHistory));
    }, [deltaHistory]);

    React.useEffect(() => {
        const errors = checkHardConstraints(inputData!, solutionData!);
        setErrorMessages(errors);
    }, [inputData, solutionData]);

    if (!inputData || !solutionData) {
        return <div>Ups, something went wrong! No data loaded.</div>;
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


    const handleDropPatient = (
        patientId: string,
        newDay: number | "none",
        newRoom: string
    ) => {
        const currentPatient = solutionData.patients.find(p => p.id === patientId);
        if (!currentPatient) return console.error("Paciente no encontrado:", patientId);

        const newOT = selectedOperatingTheater !== "no-change"
            ? selectedOperatingTheater
            : currentPatient.operating_theater;

        const change: PatientDelta = {
            patientId,
            previousAdmissionDay: currentPatient.admission_day,
            previousRoom: currentPatient.room,
        };
        setDeltaHistory(h => {
            const nh = [...h, change];
            return nh.length > MAX_HISTORY ? nh.slice(1) : nh;
        });

        const updatedPatients = solutionData.patients.map(p =>
            p.id === patientId
                ? { ...p, admission_day: newDay, room: newRoom, operating_theater: newOT }
                : p
        );

        setSolutionData({ ...solutionData, patients: updatedPatients });
        setSelectedOperatingTheater("no-change");
    };


    const handleUndo = () => {
        if (deltaHistory.length === 0) return;
        const lastChange = deltaHistory[deltaHistory.length - 1];
        setDeltaHistory(prevHistory => prevHistory.slice(0, prevHistory.length - 1));
        const updatedPatients = solutionData.patients.map((patient: PatientOutput) => {
            if (patient.id === lastChange.patientId) {
                return { ...patient, admission_day: lastChange.previousAdmissionDay, room: lastChange.previousRoom };
            }
            return patient;
        });
        setSolutionData({ ...solutionData, patients: updatedPatients });
    };

    const handleDownloadSolution = () => {
        const fileData = JSON.stringify(solutionData, null, 2);
        const blob = new Blob([fileData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'solution.json';
        link.click();
        URL.revokeObjectURL(url);
    };


    const onPatientClick = (patientId: string) => {
        setSelectedPatientId(patientId);
    };

    const onDayClick = (day: number) => {
        setSelectedDay(day);
    };


    return (
        <div className={solutionGridStyles.container}>
            <div className={solutionGridStyles.side}>
                <div className={`mb-8`}>
                    <Legend />
                </div>

                {selectedPatientId &&
                    <div className={`mb-8`}>
                        <PatientDetail patientId={selectedPatientId} />
                    </div>
                }

                {selectedDay != null &&
                    <div className={`mb-8`}>
                        <DayDetail day={selectedDay} />
                    </div>
                }

                {errorMessages.length > 0 && (
                    <div className={`${solutionGridStyles.side_content}`}>
                        <h3 className="text-center">Violations</h3>
                        {errorMessages.map((msg, index) => (
                            <p key={index} className={solutionGridStyles.error_messages}>
                                {msg}
                            </p>
                        ))}
                    </div>
                )}
            </div>


            <div className={solutionGridStyles.center}>
                <div className='mb-24'>
                    <h1>Patient Scheduler</h1>
                </div>

                <div className='flex flex-row items-center justify-center gap-16 mb-20'>
                    <button
                        onClick={handleUndo}
                        disabled={deltaHistory.length === 0}
                        className={`${solutionGridStyles.button}`}
                    >
                        Undo changes
                    </button>

                    <span>
                        Total cost {checkSoftConstraintsCost(inputData, solutionData)}
                    </span>

                    <button
                        onClick={handleDownloadSolution}
                        className={`${solutionGridStyles.button}`}
                    >
                        Download solution
                    </button>
                </div>


                <div className='flex flex-col items-center justify-center mb-16'>
                    <span className="text-[var(--color-blue)]">
                        Operating Theater Selector (Unscheduled patients doesn't have OT)
                    </span>
                    <div className='flex flex-row items-center justify-center gap-8 mt-8'>
                        {inputData.operating_theaters.map(ot => (
                            <button
                                key={ot.id}
                                onClick={() => setSelectedOperatingTheater(ot.id)}
                                className={selectedOperatingTheater === ot.id
                                    ? `${solutionGridStyles.button} ${solutionGridStyles['button--active']}`
                                    : solutionGridStyles.button}
                            >
                                {ot.id}
                            </button>
                        ))}
                        <button
                            onClick={() => setSelectedOperatingTheater("no-change")}
                            className={selectedOperatingTheater === "no-change"
                                ? `${solutionGridStyles.button} ${solutionGridStyles['button--active']}`
                                : solutionGridStyles.button}
                        >
                            No change
                        </button>
                    </div>
                </div>


                <div className="flex flex-row">
                    <div className="flex flex-col">
                        <div className="flex flex-row gap-2 items-center">
                            <div className="min-w-[2rem]"></div>
                            {Array.from({ length: days }).map((_, day) => (
                                <div key={day} className="min-w-[5.167rem]">
                                    <span
                                        onClick={() => onDayClick(day)}
                                        style={{
                                            cursor: 'pointer',
                                            textDecoration: selectedDay === day ? 'underline' : 'none'
                                        }}
                                    >
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
                                    capacity={inputData.patients.length / 2} // Arbitrary value
                                    patients={unscheduledPatients}
                                    onDropPatient={(patientId, _newDay, _newRoom) => {
                                        handleDropPatient(patientId, "none", "");
                                    }}
                                    onPatientClick={onPatientClick}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
