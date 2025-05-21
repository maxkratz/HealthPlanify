import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { PatientFullData } from '../../../types/Combined';
import { Occupant } from '../../../types/InputFile';
import { Details } from '../../../components/Details';

type RoomData = {
    roomId: string;
    capacity: number;
    patients: PatientFullData[];
    occupants: Occupant[];
};

export const RoomDetails: React.FC = () => {
    const location = useLocation();
    const { dayIndex } = useParams();
    const currentDay = Number(dayIndex);
    const roomData = location.state?.roomData as RoomData;

    if (!roomData) {
        return <div>No room data available.</div>;
    }

    return (
        <div className='flex flex-col items-center'>
            <div className='mb-16'>
                <h1>Room {roomData.roomId} Details</h1>
                <p>
                    <strong>Capacity:</strong> {roomData.capacity}
                </p>
                <p>
                    <strong>Assigned Patients:</strong> {roomData.patients.length}
                </p>
                <p>
                    <strong>Occupants:</strong> {roomData.occupants.length}
                </p>
            </div>

            <div className='mb-16'>
                <div className='mb-8'>
                    <h2>Patient List</h2>
                </div>
                {roomData.patients.length === 0 ? (
                    <p>No patients assigned.</p>
                ) : (
                    <div className="flex items-center justify-center flex-row flex-wrap gap-4">
                        {roomData.patients.map((patient: PatientFullData) => {
                            if (typeof patient.admission_day !== 'number') return false;
                            const daysLeft = (patient.admission_day + patient.length_of_stay) - currentDay;
                            return (
                                <Details key={patient.id}>
                                    <span><strong>ID:</strong> {patient.id}</span>
                                    <span><strong>Gender:</strong> {patient.gender || 'Unknown'}</span>
                                    <span><strong>Age group:</strong> {patient.age_group || 'Unknown'}</span>
                                    <span><strong>Admission day:</strong> {patient.admission_day}</span>
                                    <span><strong>Days left:</strong> {daysLeft}</span>
                                </Details>
                            );
                        })}
                    </div>
                )}
            </div>

            <div>
                <div className='mb-8'>
                    <h2>Occupant List</h2>
                </div>
                {roomData.occupants.length === 0 ? (
                    <p>No occupants assigned.</p>
                ) : (
                    <div className="flex items-center justify-center flex-row flex-wrap gap-4">
                        {roomData.occupants.map((occupant: Occupant) => {
                            const daysLeft = occupant.length_of_stay - currentDay;
                            return (
                                <Details key={occupant.id}>
                                    <span><strong>ID:</strong> {occupant.id}</span>
                                    <span><strong>Gender:</strong> {occupant.gender || 'Unknown'}</span>
                                    <span><strong>Age group:</strong>{occupant.age_group || 'Unknown'}</span>
                                    <span><strong>Days left:</strong> {daysLeft}</span>
                                </Details>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
