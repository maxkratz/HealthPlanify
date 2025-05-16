import React from 'react';
import { Link, useParams } from 'react-router-dom';
import RoomStyle from './Room.module.scss';
import { PatientFullData } from '../../types/Combined';
import { Occupant } from '../../types/InputFile';
import Elderly from '@mui/icons-material/Elderly';

export type RoomComponentProps = {
    roomId: string;
    capacity: number;
    patients: PatientFullData[];
    occupants: Occupant[];
    s1AgeDifference: number;
};

export const Room: React.FC<RoomComponentProps> = ({
    roomId,
    capacity,
    patients,
    occupants,
    s1AgeDifference,
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
                to={`/${branch}/Election/Calendar/${dayIndex}/RoomsList/${roomId}`}
                state={{ roomData }} // Necessary for RoomDetails
            >
                <div className={containerClassName}>
                    <span {...props}><strong>Room: </strong>{roomId}</span>
                    <span {...props}><strong>Capacity: </strong>{capacity}</span>
                    <span {...props}><strong>Assigned: </strong>{totalAssigned}</span>
                    {s1AgeDifference > 0 && (
                        <div className={`flex items-center justify-center flex-row gap-2`}>
                            <Elderly sx={{ color: 'var(--color-black)', fontSize: 24 }} />
                            {/* <span {...props}>
                                <strong>S1: </strong>{s1AgeDifference}
                            </span> */}
                        </div>
                    )}
                </div>
            </Link>
        </div>
    );
};
