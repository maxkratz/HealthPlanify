import React from 'react';
import styles from './Day.module.scss';

export type DayProps = {
    dayNumber: number;
    isToday?: boolean;
    isPlanned?: boolean;
};

export const Day: React.FC<DayProps> = ({
    dayNumber,
    isToday = false,
    isPlanned = false
}) => {
    const cls = [
        styles.container,
        isToday ? styles.today : '',
        isPlanned ? styles.planned : ''
    ].join(' ');
    return (
        <div className={cls}>
            <span className={styles.number}>{dayNumber}</span>
        </div>
    );
};
