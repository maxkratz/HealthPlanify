import React from 'react';
import { Link, useParams } from 'react-router-dom';
import SurgeonStyle from './Surgeon.module.scss';
import { PatientFullDataSurgeon } from '../../views/Surgeons/Surgeons';

export type SurgeonComponentProps = {
    surgeonId: string;
    patients: PatientFullDataSurgeon[];
    maxSurgeryTime: number;
};

export const Surgeon: React.FC<SurgeonComponentProps> = ({
    surgeonId,
    patients,
    maxSurgeryTime,
    ...props
}) => {
    const { branch, dayIndex } = useParams();

    const totalAssigned = patients.reduce((acc, patient) => acc + patient.surgery_duration, 0);
    let modifier = 'free';
    if (totalAssigned == 0 && maxSurgeryTime == 0) {
        modifier = 'none';
    } else if (totalAssigned >= maxSurgeryTime) {
        modifier = 'full';
    } else if (totalAssigned >= maxSurgeryTime * 0.5) {
        modifier = 'half';
    }
    const containerClassName = `${SurgeonStyle.container} ${SurgeonStyle[`container--${modifier}`]}`;

    const surgeonData = {
        surgeonId: surgeonId,
        patients: patients,
        maxSurgeryTime: maxSurgeryTime,
    };

    return (
        <div>
            <Link
                to={`/FirstElection/${branch}/Calendar/${dayIndex}/Surgeons/${surgeonId}`}
                state={{ surgeonData }} // Necessary for SurgeonDetails
            >
                <div className={containerClassName}>
                    <span {...props}>Surgeon: {surgeonId}</span>
                    <span {...props}>Max surgery time: {maxSurgeryTime}</span>
                    <span {...props}>Actual surgery time: {totalAssigned}</span>
                </div>
            </Link>
        </div>
    );
};
