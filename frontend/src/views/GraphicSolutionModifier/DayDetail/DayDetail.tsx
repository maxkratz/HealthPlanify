import React from 'react';
import { useData } from '../../../DataContext';

interface DayDetailProps {
    day: number;
}

export const DayDetail: React.FC<DayDetailProps> = ({ day }) => {
    const { inputData, solutionData } = useData();

    if (!inputData || !solutionData) {
        return <div>Ups, something went wrong! There is no loaded data</div>;
    }

    return (
        <div className='flex flex-col gap-4'>
            <h3>Day {day} Details</h3>

            <div className='flex flex-col gap-2'>
                <h4>Surgeons</h4>
                {inputData.surgeons.map((surgeon) => (
                    <div key={surgeon.id}>
                        <strong>ID:</strong> {surgeon.id} - <strong>Max Surgery Time:</strong>{" "}
                        {surgeon.max_surgery_time[day] !== undefined
                            ? `${surgeon.max_surgery_time[day]} minutes`
                            : 'N/A'}
                    </div>
                ))}
            </div>

            <div className='flex flex-col gap-2'>
                <h4>Operating Theaters</h4>
                {inputData.operating_theaters.map((ot) => (
                    <div key={ot.id}>
                        <strong>ID:</strong> {ot.id} - <strong>Availability:</strong>{" "}
                        {ot.availability[day] !== undefined
                            ? `${ot.availability[day]} minutes`
                            : 'N/A'}
                    </div>
                ))}
            </div>
        </div>
    );
};
