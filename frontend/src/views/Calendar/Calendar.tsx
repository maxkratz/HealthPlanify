import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Day } from '../../components/Day/Day';
import { useData } from "../../DataContext";

export const Calendar: React.FC = () => {
    const { branch } = useParams();
    const data = useData();
    const days = data.inputData?.days || 0;

    const generateLink = (dayIndex: number) => {
        if (branch === 'Rooms') {
            return `/${branch}/Election/Calendar/${dayIndex}/RoomsList`;
        } else if (branch === 'Nurses') {
            return `/${branch}/Election/Calendar/${dayIndex}/Shifts`;
        } else if (branch === 'Surgeons') {
            return `/${branch}/Election/Calendar/${dayIndex}/SurgeonsList`;
        } else if (branch === 'OperatingTheaters') {
            return `/${branch}/Election/Calendar/${dayIndex}/OperatingTheatersList`;
        } else {
            return `/${branch}/Election/Calendar/${dayIndex}`;
        }
    };

    return (
        <div className="flex items-center justify-center flex-col gap-8">
            <h1>{branch} Calendar</h1>
            <div className="flex items-center justify-center flex-row flex-wrap mt-16">
                {Array.from({ length: days }, (_, index) => (
                    <Link key={index} to={generateLink(index)}>
                        <Day dayNumber={index} />
                    </Link>
                ))}
            </div>
        </div>
    );
};
