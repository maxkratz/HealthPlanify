import React from 'react';
import { useLocation } from 'react-router-dom';
import { AssignedPatient } from '../NursesList/NursesList';
import { Details } from '../../../components/Details';

type NurseData = {
    nurseId: string;
    skillLevel: number;
    maxLoad: number;
    assignedPatients: AssignedPatient[];
    assignedRooms: string[];
};

export const NurseDetails: React.FC = () => {
    const location = useLocation();
    const nurseData = location.state?.nurseData as NurseData;

    if (!nurseData) {
        return <div>No nurse data available.</div>;
    }

    const { assignedPatients, assignedRooms } = nurseData;

    const maxRequiredSkill = assignedPatients.reduce((max, patient) => {
        return patient.requiredSkill > max ? patient.requiredSkill : max;
    }, 0);

    return (
        <div className='flex flex-col items-center'>
            <div className='mb-16'>
                <h1>Nurse {nurseData.nurseId} Details</h1>
                <p>
                    <strong>Skill Level:</strong> {nurseData.skillLevel}
                </p>
                <p>
                    <strong>Required Skill:</strong> {maxRequiredSkill}
                </p>
            </div>

            <div className='mb-16'>
                <h2>Assigned Rooms</h2>
                {assignedRooms.length > 0 ? (
                    <ul>
                        {assignedRooms.map(room => (
                            <li key={room}><strong>Room:</strong> {room}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No rooms assigned</p>
                )}
            </div>

            <div>
                <div className='mb-8'>
                    <h2>Assigned Patients</h2>
                </div>
                {assignedPatients.length === 0 ? (
                    <p>No patients assigned</p>
                ) : (
                    <div className="flex items-center justify-center flex-row flex-wrap gap-4">
                        {assignedPatients.map((patient) => (
                            <Details key={patient.patientId}>
                                <span><strong>ID:</strong> {patient.patientId}</span>
                                <span><strong>Workload:</strong> {patient.workload}</span>
                                <span><strong>Required Skill:</strong> {patient.requiredSkill}</span>
                            </Details>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
