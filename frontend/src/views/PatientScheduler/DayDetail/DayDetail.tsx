import React, { useState } from 'react';
import { useData } from '../../../DataContext';

interface DayDetailProps {
    day: number;
}

export const DayDetail: React.FC<DayDetailProps> = ({ day }) => {
    const { inputData, solutionData } = useData();
    const [isOpen, setIsOpen] = useState<boolean>(true);

    if (!inputData || !solutionData) {
        return <div>Ups, something went wrong! No data loaded.</div>;
    }

    const toggleDetails = () => setIsOpen(prev => !prev);

    // Compute surgeons data
    const surgeonsData = inputData.surgeons.map(surgeon => {
        const usedTime = solutionData.patients
            .filter(p => p.admission_day === day)
            .reduce((sum, p) => {
                const inp = inputData.patients.find(ip => ip.id === p.id);
                return inp?.surgeon_id === surgeon.id
                    ? sum + (inp.surgery_duration ?? 0)
                    : sum;
            }, 0);
        const maxTime = surgeon.max_surgery_time[day];
        return { id: surgeon.id, used: usedTime, max: maxTime };
    });

    // Compute operating theaters data
    const theatersData = inputData.operating_theaters.map(ot => {
        const usedTime = solutionData.patients
            .filter(p => p.admission_day === day && p.operating_theater === ot.id)
            .reduce((sum, p) => {
                const inp = inputData.patients.find(ip => ip.id === p.id);
                return sum + (inp?.surgery_duration ?? 0);
            }, 0);
        const max = ot.availability[day];
        return { id: ot.id, used: usedTime, max };
    });

    return (
        <div className="border rounded p-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-center">Day {day} Details</h3>
                <button
                    onClick={toggleDetails}
                    className="px-2 py-1 text-sm rounded"
                >
                    {isOpen ? 'Hide' : 'Show'}
                </button>
            </div>

            {isOpen && (
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-2 text-left">
                        <h4 className="text-center">Surgeons</h4>
                        <div className="grid grid-cols-[1fr_3fr] gap-4 font-semibold">
                            <div>ID</div>
                            <div>Used / Max</div>
                        </div>
                        {surgeonsData.map(s => (
                            <div key={s.id} className="grid grid-cols-[1fr_3fr] gap-4">
                                <div>{s.id}</div>
                                <div>{s.max !== undefined ? `${s.used} / ${s.max}` : 'N/A'}</div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2 text-left">
                        <h4 className="text-center">Operating Theaters</h4>
                        <div className="grid grid-cols-[1fr_3fr] gap-4 font-semibold">
                            <div>ID</div>
                            <div>Used / Max</div>
                        </div>
                        {theatersData.map(t => (
                            <div key={t.id} className="grid grid-cols-[1fr_3fr] gap-4">
                                <div>{t.id}</div>
                                <div>{t.max !== undefined ? `${t.used} / ${t.max}` : 'N/A'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
