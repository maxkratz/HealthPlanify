import React from 'react';
import { useData } from '../../../DataContext';
import { ShiftType } from '../../../types/types';

interface DayDetailProps {
    day: number;
    shift: ShiftType;
}

export const DayDetail: React.FC<DayDetailProps> = ({ day, shift }) => {
    const { inputData } = useData();

    if (!inputData) {
        return <div>Ups, something went wrong! There is no loaded data</div>;
    }

    // Filtramos las enfermeras que tengan un working_shift en este día y turno
    const nursesOnShift = inputData.nurses
        .map(nurse => {
            const ws = nurse.working_shifts.find(w => w.day === day && w.shift === shift);
            return ws ? { id: nurse.id, maxLoad: ws.max_load } : null;
        })
        .filter(Boolean) as { id: string; maxLoad: number }[];

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-center">Day {day}, {shift} shift</h3>
            {nursesOnShift.length > 0 ? (
                <div className="flex flex-col gap-2 text-left">
                    <h4 className="text-center">Nurses on duty</h4>
                    {nursesOnShift.map(n => (
                        <div key={n.id}>
                            <strong>ID:</strong> {n.id} - <strong>Max Load:</strong> {n.maxLoad}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center italic">No nurses scheduled for this day & shift.</p>
            )}
        </div>
    );
};
