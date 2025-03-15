import React from 'react';
import { Link, useParams } from 'react-router-dom';
import OperatingTheaterStyle from './OperatingTheater.module.scss';
import { PatientFullDataOperatingTheater } from '../../views/OperatingTheater/OperatingTheatersList/OperatingTheatersList';

export type OperatingTheaterComponentProps = {
    operatingTheaterId: string;
    patients: PatientFullDataOperatingTheater[];
    maxAvailableTime: number;
};

export const OperatingTheater: React.FC<OperatingTheaterComponentProps> = ({
    operatingTheaterId,
    patients,
    maxAvailableTime,
    ...props
}) => {
    const { branch, dayIndex } = useParams();

    const totalAssigned = patients.reduce((acc, patient) => acc + patient.surgery_duration, 0);
    let modifier = 'free';
    if (totalAssigned == 0 && maxAvailableTime == 0) {
        modifier = 'none';
    } else if (totalAssigned >= maxAvailableTime) {
        modifier = 'full';
    } else if (totalAssigned >= maxAvailableTime * 0.5) {
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
                to={`/FirstElection/${branch}/SecondElection/Calendar/${dayIndex}/OperatingTheatersList/${operatingTheaterId}`}
                state={{ operatingTheaterData }} // Necessary for OperatingTheaterDetails
            >
                <div className={containerClassName}>
                    <span {...props}>OperatingTheater: {operatingTheaterId}</span>
                    <span {...props}>Max available time: {maxAvailableTime}</span>
                    <span {...props}>Actual used time: {totalAssigned}</span>
                </div>
            </Link>
        </div>
    );
};
