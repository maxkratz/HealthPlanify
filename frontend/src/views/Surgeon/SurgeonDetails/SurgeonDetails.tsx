import React from 'react';
import { useLocation } from 'react-router-dom';
import { PatientFullDataSurgeon } from '../SurgeonsList/SurgeonsList';
import { Details } from '../../../components/Details';

type SurgeonData = {
    surgeonId: string;
    patients: PatientFullDataSurgeon[];
    maxSurgeryTime: number;
};

export const SurgeonDetails: React.FC = () => {
    const location = useLocation();
    const surgeonData = location.state?.surgeonData as SurgeonData;

    if (!surgeonData) {
        return <div>No surgeon data available.</div>;
    }

    return (
        <div className="flex flex-col items-center">
            <div className='mb-16'>
                <h1>Surgeon Details: {surgeonData.surgeonId}</h1>
                <p>
                    <strong>Max Surgery Time:</strong> {surgeonData.maxSurgeryTime}
                </p>
            </div>

            <div>
                <div className='mb-8'>
                    <h2>Patient List</h2>
                </div>
                {surgeonData.patients.length === 0 ? (
                    <p>No patients assigned.</p>
                ) : (
                    <div className="flex items-center justify-center flex-row flex-wrap gap-4">
                        {surgeonData.patients.map((patient: PatientFullDataSurgeon) => (
                            <Details key={patient.id}>
                                <span><strong>ID:</strong> {patient.id}</span>
                                <span><strong>Gender:</strong> {patient.gender || 'Unknown'}</span>
                                <span><strong>Age Group:</strong> {patient.age_group || 'Unknown'}</span>
                                <span><strong>Operating Theater:</strong> {patient.operating_theater || 'N/A'}</span>
                                <span><strong>Surgery Duration:</strong> {patient.surgery_duration}</span>
                            </Details>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
