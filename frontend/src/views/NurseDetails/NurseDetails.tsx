import React from 'react';
import { useLocation } from 'react-router-dom';
import NurseDetailsStyle from './NurseDetails.module.scss';

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
};

export const NurseDetails: React.FC = () => {
    const location = useLocation();
    const nurseData = (location.state as { nurseData?: NurseData })?.nurseData;

    if (!nurseData) {
        return <div>No nurse data available.</div>;
    }

    const { assignedPatients } = nurseData;

    return (
        <div className={NurseDetailsStyle.container}>
            {assignedPatients.length > 0 ? (
                <div className={NurseDetailsStyle.assignedPatients}>
                    <h2>Assigned Patients</h2>
                    <ul>
                        {assignedPatients.map((patient) => (
                            <li key={patient.patientId}>
                                ID: {patient.patientId} - Workload: {patient.workload} - Required Skill: {patient.requiredSkill}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <h2>No patients assigned</h2>
            )}
        </div>
    );
};
