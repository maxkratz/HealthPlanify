import React from 'react';
import { Link, useParams } from 'react-router-dom';
import RoomStyle from './Room.module.scss';
import { PatientFullData } from '../../types/Combined';
import { Occupant } from '../../types/InputFile';

export type RoomComponentProps = {
    roomId: string;
    capacity: number;
    patients: PatientFullData[];
    occupants: Occupant[];
};

export const Room: React.FC<RoomComponentProps> = ({
    roomId,
    capacity,
    patients,
    occupants,
    ...props
}) => {
    const { branch, dayIndex } = useParams<{ branch: string, dayIndex: string }>();

    const totalAssigned = patients.length + occupants.length;
    let modifier = 'free';
    if (totalAssigned > capacity) {
        modifier = 'overfull';
    } else if (totalAssigned == capacity) {
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
                to={`/FirstElection/${branch}/SecondElection/Calendar/${dayIndex}/RoomsList/${roomId}`}
                state={{ roomData }} // Necessary for RoomDetails
            >
                <div className={containerClassName}>
                    <span {...props}><strong>Room: </strong>{roomId}</span>
                    <span {...props}><strong>Capacity: </strong>{capacity}</span>
                    <span {...props}><strong>Assigned: </strong>{totalAssigned}</span>
                </div>
            </Link>
        </div>
    );
};
