import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Day } from '../../components/Day/Day';
import { useData } from "../../DataContext";
import { addDays, format, getDate, isSameDay } from 'date-fns';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Calendar: React.FC = () => {
    const { branch } = useParams();
    const { inputData } = useData();
    const daysCount = inputData?.days ?? 0;
    const today = new Date();

    const planningDates = new Set(
        Array.from({ length: daysCount }, (_, i) =>
            addDays(today, i).toDateString()
        )
    );

    const byMonth: Record<string, Date[]> = {};
    Array.from(planningDates).forEach(ds => {
        const d = new Date(ds);
        const key = format(d, 'yyyy-MM');
        byMonth[key] = byMonth[key] || [];
        byMonth[key].push(d);
    });
    const monthKeys = Object.keys(byMonth).sort();

    const generateLink = (date: Date) => {
        const idx = Array.from(planningDates).findIndex(ds =>
            isSameDay(new Date(ds), date)
        );
        if (branch === 'Rooms') return `/${branch}/Options/Calendar/${idx}/RoomsList`;
        if (branch === 'Nurses') return `/${branch}/Options/Calendar/${idx}/Shifts`;
        if (branch === 'Surgeons') return `/${branch}/Options/Calendar/${idx}/SurgeonsList`;
        if (branch === 'OperatingTheaters') return `/${branch}/Options/Calendar/${idx}/OperatingTheatersList`;
        return `/${branch}/Options/Calendar/${idx}`;
    };

    return (
        <div className="flex flex-wrap justify-center items-start gap-8 p-6 w-full">
            <h1 className="w-full text-center text-2xl font-semibold">
                {branch} - Planning for {daysCount} day{daysCount !== 1 ? 's' : ''}
            </h1>

            {monthKeys.map(monthKey => {
                const [year, month] = monthKey.split('-').map(Number);
                const firstOfMonth = new Date(year, month - 1, 1);
                const totalInMonth = new Date(year, month, 0).getDate();

                return (
                    <div key={monthKey} className="w-full max-w-md">
                        <h2 className="mb-6">{format(firstOfMonth, 'LLLL yyyy')}</h2>
                        <div className="grid grid-cols-7 text-center text-sm text-gray-600 mb-1">
                            {weekDays.map(wd => <div key={wd}>{wd}</div>)}
                        </div>
                        <div className="grid grid-cols-7 auto-rows-fr gap-1">
                            {Array.from({ length: totalInMonth }).map((_, idx) => {
                                const d = new Date(year, month - 1, idx + 1);
                                const key = d.toDateString();
                                const isPlanned = planningDates.has(key);
                                const isToday = isSameDay(d, today);
                                const dayNode = (
                                    <Day
                                        dayNumber={getDate(d)}
                                        isToday={isToday}
                                        isPlanned={isPlanned}
                                    />
                                );
                                return isPlanned ? (
                                    <Link key={key} to={generateLink(d)}>
                                        {dayNode}
                                    </Link>
                                ) : (
                                    <div key={key}>{dayNode}</div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
