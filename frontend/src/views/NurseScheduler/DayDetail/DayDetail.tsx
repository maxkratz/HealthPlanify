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
        <div className="flex flex-col gap-6">
            <h3 className="text-center">Day {day} Details</h3>

            <div className="flex flex-col gap-2 text-left">
                <h4 className="text-center">Surgeons</h4>
                {inputData.surgeons.map((surgeon) => {
                    const usedTime = solutionData.patients
                        .filter(p => p.admission_day === day)
                        .reduce((sum, p) => {
                            const inp = inputData.patients.find(ip => ip.id === p.id);
                            return inp?.surgeon_id === surgeon.id
                                ? sum + (inp.surgery_duration ?? 0)
                                : sum;
                        }, 0);

                    const maxTime = surgeon.max_surgery_time[day];
                    return (
                        <div key={surgeon.id}>
                            <strong>ID:</strong> {surgeon.id} —{' '}
                            <strong>Surgery Time (Max / Used):</strong>{' '}
                            {maxTime !== undefined ? `${maxTime} / ${usedTime}` : 'N/A'}
                        </div>
                    );
                })}
            </div>


            <div className="flex flex-col gap-2 text-left">
                <h4 className="text-center">Operating Theaters</h4>
                {inputData.operating_theaters.map((ot) => {
                    const usedTime = solutionData.patients
                        .filter(p => p.admission_day === day && p.operating_theater === ot.id)
                        .reduce((sum, p) => {
                            const inp = inputData.patients.find(ip => ip.id === p.id);
                            return sum + (inp?.surgery_duration ?? 0);
                        }, 0);

                    const maxAvail = ot.availability[day];
                    return (
                        <div key={ot.id}>
                            <strong>ID:</strong> {ot.id} —{' '}
                            <strong>Availability (Max / Used):</strong>{' '}
                            {maxAvail !== undefined ? `${maxAvail} / ${usedTime}` : 'N/A'}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
