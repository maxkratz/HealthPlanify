import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Day } from '../../components/Day/Day';
import { useData } from "../../DataContext";
import {
    addDays,
    format,
    getDate,
    isSameDay,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval
} from 'date-fns';
import { es } from 'date-fns/locale';

export const Calendar: React.FC = () => {
    const { branch } = useParams();
    const { inputData } = useData();
    const daysCount = inputData?.days ?? 0;
    const today = new Date();

    const weekDays = eachDayOfInterval({
        start: startOfWeek(new Date(), { weekStartsOn: 1, locale: es }),
        end: endOfWeek(new Date(), { weekStartsOn: 1, locale: es })
    }).map(d => format(d, 'EEE', { locale: es }));

    const planningDates = new Set(
        Array.from({ length: daysCount }, (_, i) =>
            addDays(today, i).toDateString()
        )
    );

    const byMonth: Record<string, Date[]> = {};
    planningDates.forEach(ds => {
        const d = new Date(ds);
        const key = format(d, 'yyyy-MM');
        (byMonth[key] ||= []).push(d);
    });
    const monthKeys = Object.keys(byMonth).sort();

    const generateLink = (date: Date) => {
        const idx = Array.from(planningDates).findIndex(ds =>
            isSameDay(new Date(ds), date)
        );
        switch (branch) {
            case 'Rooms': return `/${branch}/Calendar/${idx}/RoomsList`;
            case 'Nurses': return `/${branch}/Options/Calendar/${idx}/Shifts`;
            case 'Surgeons': return `/${branch}/Options/Calendar/${idx}/SurgeonsList`;
            case 'OperatingTheaters': return `/${branch}/Options/Calendar/${idx}/OperatingTheatersList`;
            default: return `/${branch}/Options/Calendar/${idx}`;
        }
    };

    return (
        <div className="flex flex-wrap justify-center items-start gap-8 p-6 w-full">
            <h1 className="w-full text-center text-2xl font-semibold">
                {branch} - Planificación para {daysCount} día{daysCount !== 1 ? 's' : ''}
            </h1>

            {monthKeys.map(monthKey => {
                const [year, month] = monthKey.split('-').map(Number);
                const firstOfMonth = new Date(year, month - 1, 1);
                const lastOfMonth = new Date(year, month, 0);

                const displayStart = startOfWeek(firstOfMonth, { weekStartsOn: 1 });
                const displayEnd = endOfWeek(lastOfMonth, { weekStartsOn: 1 });
                const allDates = eachDayOfInterval({ start: displayStart, end: displayEnd });

                return (
                    <div key={monthKey} className="w-full max-w-md">
                        <h2 className="mb-6">{format(firstOfMonth, 'LLLL yyyy', { locale: es })}</h2>
                        <div className="grid grid-cols-7 text-center text-sm text-[var(--color-grey)] mb-1">
                            {weekDays.map(wd => <div key={wd}>{wd}</div>)}
                        </div>
                        <div className="grid grid-cols-7 auto-rows-fr gap-1">
                            {allDates.map(d => {
                                const key = d.toDateString();
                                const isCurrentMonth = d.getMonth() === (month - 1);
                                const isPlanned = planningDates.has(key);
                                const isToday = isSameDay(d, today);

                                const cell = (
                                    <Day
                                        dayNumber={getDate(d)}
                                        isToday={isToday}
                                        isPlanned={isPlanned}
                                    />
                                );

                                const className = isCurrentMonth ? '' : 'opacity-50';

                                return isPlanned ? (
                                    <Link
                                        key={key}
                                        to={generateLink(d)}
                                        className={className}
                                    >
                                        {cell}
                                    </Link>
                                ) : (
                                    <div key={key} className={className}>
                                        {cell}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
