import React from 'react';

import DayStyle from './Day.module.scss';

export type DayComponentProps = {
    dayNumber: number;
};

export const Day: React.FC<DayComponentProps> = ({
    dayNumber,
    ...props
}) => {

    return (
        <div className={DayStyle.container}>
            <span {...props}>{dayNumber}</span>
        </div>
    );
};