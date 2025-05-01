import React from 'react';
import { useDrop } from 'react-dnd';
import NurseCard from '../NurseCard/NurseCard';
import { NurseInfo } from '../NurseScheduler/NurseScheduler';
import { ShiftType } from '../../../types/types';

interface SlotProps {
    day: number;
    shift: ShiftType;
    roomId: string;
    slotIndex: number;
    nurse?: NurseInfo;
    onDropNurse: (nurseId: string, newDay: number, newRoom: string, slotIndex: number) => void;
    onRemoveNurse: (nurseId: string, day: number, shift: ShiftType, roomId: string) => void;
    onNurseClick: (nurseId: string) => void;
}

const Slot: React.FC<SlotProps> = ({ day, shift, roomId, slotIndex, nurse, onDropNurse, onRemoveNurse, onNurseClick }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'NURSE',
        drop: (item: { id: string }) => {
            onDropNurse(item.id, day, roomId, slotIndex);
        },
        collect: (monitor) => ({ isOver: !!monitor.isOver() }),
    }), [day, shift, roomId, slotIndex, onDropNurse]);

    return (
        <div
            ref={drop as any}
            style={{
                minHeight: '2.75rem',
                minWidth: '4.5rem',
                border: isOver ? '0.125rem dashed var(--color-rose)' : '0.063rem solid var(--color-white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {nurse && (
                <NurseCard
                    nurse={nurse}
                    onClick={onNurseClick}
                    onRemove={(nid) => onRemoveNurse(nid, day, shift, roomId)}
                    removeContext={{ day, shift, roomId }}
                />
            )}
        </div>
    );
};

interface RoomCellProps {
    day: number;
    shift: ShiftType;
    roomId: string;
    capacity: number;
    nurses: NurseInfo[];
    onDropNurse: (nurseId: string, newDay: number, newRoom: string, slotIndex: number) => void;
    onRemoveNurse: (nurseId: string, day: number, shift: ShiftType, roomId: string) => void;
    onNurseClick: (nurseId: string) => void;
}

const RoomCell: React.FC<RoomCellProps> = ({ day, shift, roomId, capacity, nurses, onDropNurse, onRemoveNurse, onNurseClick }) => {
    const slotSlots = Array.from({ length: capacity }, (_, index) => ({ slotIndex: index, nurse: nurses[index] }));

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '0.25rem',
                padding: '0.25rem',
                border: '0.063rem solid var(--color-white)',
            }}
        >
            {slotSlots.map(({ slotIndex, nurse }) => (
                <Slot
                    key={slotIndex}
                    day={day}
                    shift={shift}
                    roomId={roomId}
                    slotIndex={slotIndex}
                    nurse={nurse}
                    onDropNurse={onDropNurse}
                    onRemoveNurse={onRemoveNurse}
                    onNurseClick={onNurseClick}
                />
            ))}
        </div>
    );
};

export default RoomCell;