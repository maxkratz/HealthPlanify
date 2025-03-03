import React from 'react';
import { Sun, SunHorizon, Moon } from 'phosphor-react';
import ShiftStyle from './Shift.module.scss';

export type ShiftComponentProps = {
    children: React.ReactNode;
    shiftType: 'early' | 'late' | 'night';
};

export const Shift: React.FC<ShiftComponentProps> = ({
    children,
    shiftType,
    ...props
}) => {
    const renderIcon = () => {
        switch (shiftType) {
            case 'early':
                return <Sun size={24} weight="fill" color="var(--color-white)" />;
            case 'late':
                return <SunHorizon size={24} weight="fill" color="var(--color-white)" />;
            case 'night':
                return <Moon size={24} weight="fill" color="var(--color-white)" />;
            default:
                return null;
        }
    };

    return (
        <div className={`${ShiftStyle.container} flex items-center justify-center flex-row gap-2`}>
            {renderIcon()}
            <span {...props}>{children}</span>
        </div>
    );
};
