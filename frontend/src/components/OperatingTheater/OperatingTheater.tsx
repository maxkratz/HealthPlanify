import React from 'react';
import { Link, useParams } from 'react-router-dom';
import OperatingTheaterStyle from './OperatingTheater.module.scss';
import { PatientFullDataOperatingTheater } from '../../views/OperatingTheater/OperatingTheatersList/OperatingTheatersList';

export type OperatingTheaterComponentProps = {
    operatingTheaterId: string;
    patients: PatientFullDataOperatingTheater[];
    maxAvailableTime: number;
    totalTimeAssigned: number;
};

export const OperatingTheater: React.FC<OperatingTheaterComponentProps> = ({
    operatingTheaterId,
    patients,
    maxAvailableTime,
    totalTimeAssigned,
    ...props
}) => {
    const { branch, dayIndex } = useParams();

    let modifier = 'free';
    if (totalTimeAssigned > maxAvailableTime) {
        modifier = 'overfull';
    } else if (totalTimeAssigned == maxAvailableTime) {
        modifier = 'full';
    } else if (totalTimeAssigned >= maxAvailableTime * 0.5) {
        modifier = 'half';
    }
    const containerClassName = `${OperatingTheaterStyle.container} ${OperatingTheaterStyle[`container--${modifier}`]}`;

    const operatingTheaterData = {
        operatingTheaterId: operatingTheaterId,
        patients: patients,
        maxAvailableTime: maxAvailableTime,
    };

    return (
        <div>
            <Link
                to={`/${branch}/Election/Calendar/${dayIndex}/OperatingTheatersList/${operatingTheaterId}`}
                state={{ operatingTheaterData }} // Necessary for OperatingTheaterDetails
            >
                <div className={containerClassName}>
                    <span {...props}><strong>OperatingTheater: </strong>{operatingTheaterId}</span>
                    <span {...props}><strong>Max available time: </strong>{maxAvailableTime}</span>
                    <span {...props}><strong>Actual used time: </strong>{totalTimeAssigned}</span>
                </div>
            </Link>
        </div>
    );
};
