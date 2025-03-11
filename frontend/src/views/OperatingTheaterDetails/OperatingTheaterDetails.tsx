import React from 'react';
import { useLocation } from 'react-router-dom';
import { PatientFullDataOperatingTheater } from '../OperatingTheatersList/OperatingTheatersList';

type OperatingTheaterData = {
    operatingTheaterId: string;
    patients: PatientFullDataOperatingTheater[];
    maxAvailableTime: number;
};

export const OperatingTheaterDetails: React.FC = () => {
    const location = useLocation();
    const operatingTheaterData = location.state?.operatingTheaterData as OperatingTheaterData;

    if (!operatingTheaterData) {
        return <div>No operating theater data available.</div>;
    }

    return (
        <div className="flex flex-col items-center gap-8">
            <section>
                <h1>Operating Theater Details: {operatingTheaterData.operatingTheaterId}</h1>
                <p>
                    <strong>Max Surgery Time:</strong> {operatingTheaterData.maxAvailableTime}
                </p>
            </section>

            <section>
                <h2>Patient List</h2>
                {operatingTheaterData.patients.length === 0 ? (
                    <p>No patients assigned.</p>
                ) : (
                    <ul>
                        {operatingTheaterData.patients.map((patient: PatientFullDataOperatingTheater) => (
                            <li key={patient.id}>
                                <strong>ID:</strong> {patient.id} -{' '}
                                <strong>Gender:</strong> {patient.gender || 'Unknown'} -{' '}
                                <strong>Age Group:</strong> {patient.age_group || 'Unknown'} -{' '}
                                <strong>Surgeon:</strong> {patient.surgeon_id || 'N/A'} -{' '}
                                <strong>Surgery Duration:</strong> {patient.surgery_duration}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};
