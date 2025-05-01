import React from 'react';
import { useDrop } from 'react-dnd';
import NurseCard from '../NurseCard/NurseCard';
import { NurseInfo } from '../NurseScheduler/NurseScheduler';
import { ShiftType } from '../../../types/types';

interface BedSlotProps {
    day: number | 'none';
    shift: ShiftType;
    roomId: string;
    bedIndex: number;
    nurse?: NurseInfo;
    onDropNurse: (nurseId: string, newRoom: string, bedIndex: number) => void;
    onRemoveNurse: (nurseId: string, day: number | 'none', shift: ShiftType, roomId: string) => void;
    onNurseClick: (nurseId: string) => void;
}

const BedSlot: React.FC<BedSlotProps> = ({ day, shift, roomId, bedIndex, nurse, onDropNurse, onRemoveNurse, onNurseClick }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'NURSE',
        drop: (item: { id: string }) => {
            onDropNurse(item.id, roomId, bedIndex);
        },
        collect: (monitor) => ({ isOver: !!monitor.isOver() }),
    }), [day, shift, roomId, bedIndex, onDropNurse]);

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
    day: number | 'none';
    shift: ShiftType;
    roomId: string;
    capacity: number;
    nurses: NurseInfo[];
    onDropNurse: (nurseId: string, newRoom: string, bedIndex: number) => void;
    onRemoveNurse: (nurseId: string, day: number | 'none', shift: ShiftType, roomId: string) => void;
    onNurseClick: (nurseId: string) => void;
}

const RoomCell: React.FC<RoomCellProps> = ({ day, shift, roomId, capacity, nurses, onDropNurse, onRemoveNurse, onNurseClick }) => {
    const bedSlots = Array.from({ length: capacity }, (_, index) => ({ bedIndex: index, nurse: nurses[index] }));

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
            {bedSlots.map(({ bedIndex, nurse }) => (
                <BedSlot
                    key={bedIndex}
                    day={day}
                    shift={shift}
                    roomId={roomId}
                    bedIndex={bedIndex}
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