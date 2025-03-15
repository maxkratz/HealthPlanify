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
            return `/FirstElection/${branch}/SecondElection/Calendar/${dayIndex}/RoomsList`;
        } else if (branch === 'Nurses') {
            return `/FirstElection/${branch}/SecondElection/Calendar/${dayIndex}/Shifts`;
        } else if (branch === 'Surgeons') {
            return `/FirstElection/${branch}/SecondElection/Calendar/${dayIndex}/SurgeonsList`;
        } else if (branch === 'OperatingTheaters') {
            return `/FirstElection/${branch}/SecondElection/Calendar/${dayIndex}/OperatingTheatersList`;
        } else {
            return `/FirstElection/${branch}/SecondElection/Calendar/${dayIndex}`;
        }
    };

    return (
        <div className="flex items-center justify-center flex-col gap-8">
            <h1>{branch} Calendar</h1>
            <div className="flex items-center justify-center flex-row flex-wrap m-4">
                {Array.from({ length: days }, (_, index) => (
                    <Link key={index} to={generateLink(index)}>
                        <Day dayNumber={index} />
                    </Link>
                ))}
            </div>
        </div>
    );
};
