import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useData } from "../../DataContext";
import { PatientOutput } from '../../types/SolutionFile';
import { Occupant } from '../../types/InputFile';

type RoomData = {
    roomId: string;
    capacity: number;
    patients: PatientOutput[];
    occupants: Occupant[];
};

export const RoomDetails: React.FC = () => {
    const location = useLocation();
    const { dayIndex } = useParams();
    const currentDay = Number(dayIndex);
    const data = useData();
    const roomData = location.state?.roomData as RoomData;

    if (!roomData) {
        return <div>No room data available.</div>;
    }

    return (
        <div className='flex flex-col items-center gap-8'>
            <section>
                <h1>Room Details: {roomData.roomId}</h1>
                <p>
                    <strong>Capacity:</strong> {roomData.capacity}
                </p>
                <p>
                    <strong>Assigned Patients:</strong> {roomData.patients.length}
                </p>
                <p>
                    <strong>Occupants:</strong> {roomData.occupants.length}
                </p>
            </section>

            <section>
                <h2>Patient List</h2>
                {roomData.patients.length === 0 ? (
                    <p>No patients assigned.</p>
                ) : (
                    <ul>
                        {roomData.patients.map((patient: PatientOutput) => {
                            const inputPatient = data.inputData?.patients.find(p => p.id === patient.id);
                            const daysLeft = inputPatient
                                ? (patient.admission_day + inputPatient.length_of_stay) - currentDay
                                : 'N/A';
                            return (
                                <li key={patient.id}>
                                    <strong>ID:</strong> {patient.id} -{' '}
                                    <strong>Admission Day:</strong> {patient.admission_day} -{' '}
                                    <strong>Gender:</strong> {inputPatient?.gender || 'Unknown'} -{' '}
                                    <strong>Age Group:</strong> {inputPatient?.age_group || 'Unknown'} -{' '}
                                    <strong>Days Left:</strong> {daysLeft}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            <section>
                <h2>Occupant List</h2>
                {roomData.occupants.length === 0 ? (
                    <p>No occupants assigned.</p>
                ) : (
                    <ul>
                        {roomData.occupants.map((occupant: Occupant) => {
                            const daysLeft = occupant.length_of_stay - currentDay;
                            return (
                                <li key={occupant.id}>
                                    <strong>ID:</strong> {occupant.id} -{' '}
                                    <strong>Gender:</strong> {occupant.gender} -{' '}
                                    <strong>Age Group:</strong> {occupant.age_group} -{' '}
                                    <strong>Days Left:</strong> {daysLeft}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
};
