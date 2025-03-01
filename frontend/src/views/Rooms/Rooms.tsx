import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Room } from '../../components/Room/Room';
import { useData } from "../../DataContext";

export const Rooms: React.FC = () => {
    const { branch, dayIndex } = useParams();
    const data = useData();
    const rooms = data.inputData?.rooms || [];

    return (
        <div className="flex flex-row gap-4">
            {rooms.map((room) => (
                <Link key={room.id} to={`/FirstElection/${branch}/Calendar/${dayIndex}/Rooms/${room.id}`}>
                    <Room roomId={room.id} capacity={room.capacity} />
                </Link>
            ))}
        </div>
    );
};
