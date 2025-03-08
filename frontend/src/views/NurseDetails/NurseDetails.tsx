import React from 'react';
import { useLocation } from 'react-router-dom';

type AssignedPatient = {
    patientId: string;
    workload: number;
    requiredSkill: number;
};

type NurseData = {
    nurseId: string;
    skillLevel: number;
    maxLoad: number;
    assignedPatients: AssignedPatient[];
    assignedRooms: string[];
};

export const NurseDetails: React.FC = () => {
    const location = useLocation();
    const nurseData = (location.state as { nurseData?: NurseData })?.nurseData;

    if (!nurseData) {
        return <div>No nurse data available.</div>;
    }

    const { assignedPatients, assignedRooms } = nurseData;

    const maxRequiredSkill = assignedPatients.reduce((max, patient) => {
        return patient.requiredSkill > max ? patient.requiredSkill : max;
    }, 0);

    return (
        <div className='flex flex-col items-center gap-8'>
            <section>
                <h1>Nurse Details: {nurseData.nurseId}</h1>
                <p>
                    <strong>Skill Level:</strong> {nurseData.skillLevel}
                </p>
                <p>
                    <strong>Required Skill:</strong> {maxRequiredSkill}
                </p>
            </section>

            <section>
                <h2>Assigned Rooms</h2>
                {assignedRooms.length > 0 ? (
                    <ul>
                        {assignedRooms.map(room => (
                            <li key={room}>Room: {room}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No rooms assigned</p>
                )}
            </section>

            <section>
                <h2>Assigned Patients</h2>
                {assignedPatients.length > 0 ? (
                    <ul>
                        {assignedPatients.map((patient) => (
                            <li key={patient.patientId}>
                                ID: {patient.patientId} - Workload: {patient.workload} - Required Skill: {patient.requiredSkill}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <h2>No patients assigned</h2>
                )}
            </section>
        </div>
    );
};
