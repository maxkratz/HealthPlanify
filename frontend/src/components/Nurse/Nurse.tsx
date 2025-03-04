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

    const maxRequiredSkill = assignedPatients.reduce((max, patient) => {
        return patient.requiredSkill > max ? patient.requiredSkill : max;
    }, 0);

    return (
        <div className={NurseStyle.container}>
            <span {...props}>Nurse: {nurseId}</span>
            <span {...props}>Skill Level: {skillLevel}</span>
            <span {...props}>Required Skill: {maxRequiredSkill}</span>
            <span {...props}>Max Load: {maxLoad}</span>
            <span {...props}>Actual Load: {actualLoad}</span>
        </div>
    );
};
