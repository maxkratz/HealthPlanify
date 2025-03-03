import React from 'react';

import ShiftStyle from './Shift.module.scss';

export type ShiftComponentProps = {
    children: React.ReactNode;
};

export const Shift: React.FC<ShiftComponentProps> = ({
    children,
    ...props
}) => {

    return (
        <div className={ShiftStyle.container}>
            <span {...props}>{children}</span>
        </div>
    );
};