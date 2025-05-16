import React from 'react';
import { Link, useParams } from 'react-router-dom';
import SurgeonStyle from './Surgeon.module.scss';
import { PatientFullDataSurgeon } from '../../views/Surgeon/SurgeonsList/SurgeonsList';

export type SurgeonComponentProps = {
    surgeonId: string;
    patients: PatientFullDataSurgeon[];
    maxSurgeryTime: number;
    totalTimeAssigned: number;
};

export const Surgeon: React.FC<SurgeonComponentProps> = ({
    surgeonId,
    patients,
    maxSurgeryTime,
    totalTimeAssigned,
    ...props
}) => {
    const { branch, dayIndex } = useParams();

    let modifier = 'free';
    if (totalTimeAssigned > maxSurgeryTime) {
        modifier = 'overfull';
    } else if (totalTimeAssigned == maxSurgeryTime) {
        modifier = 'full';
    } else if (totalTimeAssigned >= maxSurgeryTime * 0.5) {
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
                to={`/${branch}/Election/Calendar/${dayIndex}/SurgeonsList/${surgeonId}`}
                state={{ surgeonData }} // Necessary for SurgeonDetails
            >
                <div className={containerClassName}>
                    <span {...props}><strong>Surgeon: </strong>{surgeonId}</span>
                    <span {...props}><strong>Max surgery time: </strong>{maxSurgeryTime}</span>
                    <span {...props}><strong>Actual surgery time: </strong>{totalTimeAssigned}</span>
                </div>
            </Link>
        </div>
    );
};
