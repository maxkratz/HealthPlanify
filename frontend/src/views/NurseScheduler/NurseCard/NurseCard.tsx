import React from 'react';
import { useDrag } from 'react-dnd';
import { NurseInfo } from '../NurseScheduler/NurseScheduler'


interface NurseCardProps {
    nurse: NurseInfo;
    onClick?: (nurseId: string) => void;
}

const NurseCard: React.FC<NurseCardProps> = ({ nurse, onClick }) => {
    const isInteractive = true;

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'NURSE',
        item: { id: nurse.id },
        canDrag: isInteractive,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [nurse, isInteractive]);

    const finalOpacity = isInteractive ? (isDragging ? 0.2 : 1) : 0.2;

    const handleClick = () => {
        if (isInteractive && onClick) {
            onClick(nurse.id);
        }
    };

    return (
        <div
            ref={drag as any}
            style={{
                opacity: finalOpacity,
                border: `0.188rem solid var(--color-white)`,
                padding: '0.25rem',
                margin: '0.125rem',
                backgroundColor: 'var(--color-rose)',
                cursor: isInteractive ? 'move' : 'default',
                textAlign: 'center',
                minWidth: '4rem',
            }}
            onClick={handleClick}
        >
            {nurse.id}
        </div>
    );
};

export default NurseCard;
