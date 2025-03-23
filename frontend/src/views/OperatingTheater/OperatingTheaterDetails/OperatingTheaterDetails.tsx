import React from 'react';
import { useLocation } from 'react-router-dom';
import { PatientFullDataOperatingTheater } from '../OperatingTheatersList/OperatingTheatersList';
import { Details } from '../../../components/Details';

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
            <div className='mb-16'>
                <h1>Operating Theater Details: {operatingTheaterData.operatingTheaterId}</h1>
                <p>
                    <strong>Max Surgery Time:</strong> {operatingTheaterData.maxAvailableTime}
                </p>
            </div>

            <div>
                <div className='mb-8'>
                    <h2>Patient List</h2>
                </div>
                {operatingTheaterData.patients.length === 0 ? (
                    <p>No patients assigned.</p>
                ) : (
                    <div className="flex items-center justify-center flex-row flex-wrap gap-4">
                        {operatingTheaterData.patients.map((patient: PatientFullDataOperatingTheater) => (
                            <Details key={patient.id}>
                                <span><strong>ID:</strong> {patient.id}</span>
                                <span><strong>Gender:</strong> {patient.gender || 'Unknown'}</span>
                                <span><strong>Age Group:</strong> {patient.age_group || 'Unknown'}</span>
                                <span><strong>Surgeon:</strong> {patient.surgeon_id || 'N/A'}</span>
                                <span><strong>Surgery Duration:</strong> {patient.surgery_duration}</span>
                            </Details>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
