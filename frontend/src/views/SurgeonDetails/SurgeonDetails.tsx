import React from 'react';
import { useLocation } from 'react-router-dom';
import { PatientFullDataSurgeon } from '../../views/Surgeons/Surgeons';

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
        <div className="flex flex-col items-center gap-8">
            <section>
                <h1>Surgeon Details: {surgeonData.surgeonId}</h1>
                <p>
                    <strong>Max Surgery Time:</strong> {surgeonData.maxSurgeryTime}
                </p>
            </section>

            <section>
                <h2>Patient List</h2>
                {surgeonData.patients.length === 0 ? (
                    <p>No patients assigned.</p>
                ) : (
                    <ul>
                        {surgeonData.patients.map((patient: PatientFullDataSurgeon) => (
                            <li key={patient.id}>
                                <strong>ID:</strong> {patient.id} -{' '}
                                <strong>Gender:</strong> {patient.gender || 'Unknown'} -{' '}
                                <strong>Age Group:</strong> {patient.age_group || 'Unknown'} -{' '}
                                <strong>Operating Theater:</strong> {patient.operating_theater || 'N/A'} -{' '}
                                <strong>Surgery Duration:</strong> {patient.surgery_duration}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};
