import React from 'react';
import SortButtonStyle from './SortButton.module.scss';
import { SortAscending, SortDescending } from 'phosphor-react';

interface SortButtonProps {
    onClick: () => void;
    active: boolean;
    icon?: React.ReactNode;
    label: string;
    sortDirection?: "asc" | "desc";
}

export const SortButton: React.FC<SortButtonProps> = ({ onClick, active, icon, label, sortDirection }) => {
    return (
        <button
            onClick={onClick}
            className={
                active
                    ? `${SortButtonStyle.container} ${SortButtonStyle['container--active']}`
                    : SortButtonStyle.container
            }
        >
            {sortDirection !== undefined && (
                sortDirection === 'asc' ? (
                    <SortAscending size={20} weight="fill" color="var(--color-blue)" />
                ) : (
                    <SortDescending size={20} weight="fill" color="var(--color-blue)" />
                )
            )}
            <span>{label}</span>
            {icon}
        </button>
    );
};
