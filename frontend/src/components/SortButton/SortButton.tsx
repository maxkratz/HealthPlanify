import React from 'react';
import SortButtonStyle from './SortButton.module.scss';

interface SortButtonProps {
    onClick: () => void;
    active: boolean;
    icon: React.ReactNode;
    label: string;
}

export const SortButton: React.FC<SortButtonProps> = ({ onClick, active, icon, label }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1 p-2 rounded ${active ? SortButtonStyle.active : SortButtonStyle.inactive}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
};
