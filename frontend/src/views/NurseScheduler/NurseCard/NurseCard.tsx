import React from 'react';
import { useDrag } from 'react-dnd';
import { NurseInfo } from '../NurseScheduler/NurseScheduler';
import { ShiftType } from '../../../types/types';

interface NurseCardProps {
    nurse: NurseInfo;
    onClick?: (nurseId: string) => void;
    onRemove?: (nurseId: string, day: number, shift: ShiftType, roomId: string) => void;
    removeContext?: { day: number; shift: ShiftType; roomId: string };
}

/**
 * Generates a distinct HSL-based color per nurse index using the golden angle.
 * Parses numeric suffix from ID (e.g., "n012" -> 12) to compute hue.
 */
function getColorFromId(id: string): string {
    // Extract numeric part
    const match = id.match(/\d+/);
    const index = match ? parseInt(match[0], 10) : 0;
    // Golden angle in degrees
    const goldenAngle = 137.50776405;
    // Compute hue by multiplying index by golden angle mod 360
    const hue = (index * goldenAngle) % 360;
    // Use moderate saturation and lightness
    return `hsl(${Math.floor(hue)}, 65%, 55%)`;
}

const NurseCard: React.FC<NurseCardProps> = ({ nurse, onClick, onRemove, removeContext }) => {
    const isInteractive = true;
    const bgColor = getColorFromId(nurse.id);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'NURSE',
        item: { id: nurse.id },
        canDrag: isInteractive,
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
        end: (_item, monitor) => {
            if (!monitor.didDrop() && onRemove && removeContext) {
                onRemove(nurse.id, removeContext.day, removeContext.shift, removeContext.roomId);
            }
        }
    }), [nurse, isInteractive, onRemove, removeContext]);

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
                border: '0.188rem solid var(--color-white)',
                padding: '0.25rem',
                margin: '0.125rem',
                backgroundColor: bgColor,
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
