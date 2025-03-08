import React from 'react';
import { Link, useParams } from 'react-router-dom';
import RoomStyle from './Room.module.scss';
import { PatientOutput } from '../../types/SolutionFile';
import { Occupant } from '../../types/InputFile';

export type RoomComponentProps = {
    roomId: string;
    capacity: number;
    patients: PatientOutput[];
    occupants: Occupant[];
};

export const Room: React.FC<RoomComponentProps> = ({
    roomId,
    capacity,
    patients,
    occupants,
    ...props
}) => {
    const { branch, dayIndex } = useParams();

    const totalAssigned = patients.length + occupants.length;
    let modifier = 'free';
    if (totalAssigned >= capacity) {
        modifier = 'full';
    } else if (totalAssigned >= capacity * 0.5) {
        modifier = 'half';
    }
    const containerClassName = `${RoomStyle.container} ${RoomStyle[`container--${modifier}`]}`;

    const roomData = {
        roomId: roomId,
        capacity: capacity,
        patients: patients,
        occupants: occupants,
    };

    return (
        <div>
            <Link
                to={`/FirstElection/${branch}/Calendar/${dayIndex}/Rooms/${roomId}`}
                state={{ roomData }} // Necessary for RoomDetails
            >
                <div className={containerClassName}>
                    <span {...props}>Room: {roomId}</span>
                    <span {...props}>Capacity: {capacity}</span>
                    <span {...props}>Assigned: {totalAssigned}</span>
                </div>
            </Link>
        </div>
    );
};
