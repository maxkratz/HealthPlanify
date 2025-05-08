import React from 'react';
import { useData } from '../../../DataContext';
import { ShiftType } from '../../../types/types';

interface DayDetailProps {
    day: number;
    shift: ShiftType;
}

export const DayDetail: React.FC<DayDetailProps> = ({ day, shift }) => {
    const { inputData, solutionData } = useData();

    if (!inputData || !solutionData) {
        return <div>Ups, something went wrong! There is no loaded data</div>;
    }

    const shiftIndexMap: Record<ShiftType, number> = {
        early: 0,
        late: 1,
        night: 2,
    };
    const shiftIndex = shiftIndexMap[shift];
    const shiftsPerDay = inputData.shift_types.length;

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
                    {nursesOnShift.map(n => {
                        const nurseSol = solutionData.nurses.find(ns => ns.id === n.id);
                        const assignment = nurseSol?.assignments.find(a => a.day === day && a.shift === shift);
                        const rooms = assignment?.rooms || [];

                        let usedLoad = 0;
                        solutionData.patients.forEach(p => {
                            if (p.admission_day === 'none') return;
                            const admDay = p.admission_day as number;
                            const stayLength = (
                                inputData.patients.find(pi => pi.id === p.id)?.length_of_stay || 0
                            );
                            if (day >= admDay && day < admDay + stayLength) {
                                if (rooms.includes(p.room)) {
                                    const idx = (day - admDay) * shiftsPerDay + shiftIndex;
                                    const workloadVec =
                                        inputData.patients.find(pi => pi.id === p.id)?.workload_produced || [];
                                    const load = workloadVec[idx] || 0;
                                    usedLoad += load;
                                }
                            }
                        });

                        return (
                            <div key={n.id} className="flex justify-between">
                                <div>
                                    <strong>ID:</strong> {n.id}
                                </div>
                                <div>
                                    <strong>Load:</strong> {usedLoad} / {n.maxLoad}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-center italic">No nurses scheduled for this day & shift.</p>
            )}
        </div>
    );
};
