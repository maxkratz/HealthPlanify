import React from 'react';
import NurseStyle from './Nurse.module.scss';

type AssignedPatient = {
    patientId: string;
    workload: number;
    requiredSkill: number;
};

export type NurseComponentProps = {
    nurseId: string;
    skillLevel: number;
    maxLoad: number;
    assignedPatients: AssignedPatient[];
};

export const Nurse: React.FC<NurseComponentProps> = ({
    nurseId,
    skillLevel,
    maxLoad,
    assignedPatients,
    ...props
}) => {
    const actualLoad = assignedPatients.reduce((sum, patient) => sum + patient.workload, 0);

    let modifier = 'free';
    if (actualLoad >= maxLoad) {
        modifier = 'full';
    } else if (actualLoad >= maxLoad * 0.5) {
        modifier = 'half';
    }

    const containerClassName = `${NurseStyle.container} ${NurseStyle[`container--${modifier}`]}`;

    return (
        <div className={containerClassName}>
            <span {...props}>Nurse: {nurseId}</span>
            <span {...props}>Max Load: {maxLoad}</span>
            <span {...props}>Actual Load: {actualLoad}</span>
        </div>
    );
};
