import React from 'react';
import { useDrop } from 'react-dnd';
import NurseCard from '../NurseCard/NurseCard';
import { NurseInfo } from '../NurseScheduler/NurseScheduler';

interface BedSlotProps {
    day: number | "none";
    roomId: string;
    bedIndex: number;
    nurse?: NurseInfo;
    onDropNurse: (nurseId: string, newRoom: string, bedIndex: number) => void;
    onNurseClick: (nurseId: string) => void;
}

const BedSlot: React.FC<BedSlotProps> = ({ day, roomId, bedIndex, nurse, onDropNurse, onNurseClick }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'NURSE',
        drop: (item: { id: string }) => {
            onDropNurse(item.id, roomId, bedIndex);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [day, roomId, bedIndex, onDropNurse]);

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
            {nurse ? <NurseCard nurse={nurse} onClick={onNurseClick} /> : null}
        </div>
    );
};

interface RoomCellProps {
    day: number | "none";
    roomId: string;
    capacity: number;
    nurses: NurseInfo[];
    onDropNurse: (nurseId: string, newRoom: string, bedIndex: number) => void;
    onNurseClick: (nurseId: string) => void;
}

const RoomCell: React.FC<RoomCellProps> = ({ day, roomId, capacity, nurses, onDropNurse, onNurseClick }) => {
    // In a specific shift there is only one nurse per room
    const bedSlots = Array.from({ length: 1 }, (_, index) => ({
        bedIndex: index,
        nurse: nurses[index],
    }));

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: "1fr",
                gap: '0.25rem',
                padding: '0.25rem',
                border: '0.063rem solid var(--color-white)',
            }}
        >
            {bedSlots.map(({ bedIndex, nurse }) => (
                <BedSlot
                    key={bedIndex}
                    day={day}
                    roomId={roomId}
                    bedIndex={bedIndex}
                    nurse={nurse}
                    onDropNurse={onDropNurse}
                    onNurseClick={onNurseClick}
                />
            ))}
        </div>
    );
};

export default RoomCell;
