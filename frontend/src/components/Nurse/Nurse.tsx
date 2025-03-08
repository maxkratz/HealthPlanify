import React from 'react';
import { Link, useParams } from 'react-router-dom';
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
    assignedRooms: string[];
};

export const Nurse: React.FC<NurseComponentProps> = ({
    nurseId,
    skillLevel,
    maxLoad,
    assignedPatients,
    assignedRooms,
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

    const { branch, dayIndex, shiftType } = useParams<{ branch: string, dayIndex: string, shiftType: string }>();
    const nurseData = {
        nurseId: nurseId,
        skillLevel: skillLevel,
        maxLoad: maxLoad,
        assignedPatients: assignedPatients,
        assignedRooms: assignedRooms,
    };

    return (
        <div>
            <Link
                to={`/FirstElection/${branch}/Calendar/${dayIndex}/Shifts/${shiftType}/NursesInfo/${nurseId}`}
                state={{ nurseData }} // Necessary for NurseDetails
            >
                <div className={containerClassName}>
                    <span {...props}>Nurse: {nurseId}</span>
                    <span {...props}>Max Load: {maxLoad}</span>
                    <span {...props}>Actual Load: {actualLoad}</span>
                </div>
            </Link>
        </div>
    );
};
