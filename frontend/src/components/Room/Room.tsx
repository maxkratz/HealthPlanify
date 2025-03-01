import React from 'react';

import RoomStyle from './Room.module.scss';

export type RoomComponentProps = {
    roomId: string;
    capacity: number;
};

export const Room: React.FC<RoomComponentProps> = ({
    roomId,
    capacity,
    ...props
}) => {

    return (
        <div className={RoomStyle.container}>
            <span {...props}>{roomId}</span>
            <span {...props}>{capacity}</span>
        </div>
    );
};