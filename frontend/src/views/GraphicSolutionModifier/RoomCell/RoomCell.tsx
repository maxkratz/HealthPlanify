import React from 'react';
import { useDrop } from 'react-dnd';
import { PatientFullData } from '../../../types/Combined';
import PatientCard from '../PatientCard/PatientCard';

interface RoomCellProps {
    day: number;
    roomId: string;
    capacity: number;
    patients: PatientFullData[]; // Se asume que el orden del arreglo corresponde a la cama asignada (índice)
    onDropPatient: (patientId: string, newDay: number, newRoom: string, bedIndex: number) => void;
}

interface BedSlotProps {
    day: number;
    roomId: string;
    bedIndex: number;
    patient?: PatientFullData;
    onDropPatient: (patientId: string, newDay: number, newRoom: string, bedIndex: number) => void;
}

const BedSlot: React.FC<BedSlotProps> = ({ day, roomId, bedIndex, patient, onDropPatient }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'PATIENT',
        drop: (item: { id: string }) => {
            onDropPatient(item.id, day, roomId, bedIndex);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [day, roomId, bedIndex, onDropPatient]);

    return (
        <div
            ref={drop as any}
            style={{
                minHeight: '44px',
                minWidth: '61px',
                border: isOver ? '2px dashed var(--color-rose)' : '1px solid var(--color-white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {patient ? <PatientCard patient={patient} /> : null}
        </div>
    );
};

const RoomCell: React.FC<RoomCellProps> = ({ day, roomId, capacity, patients, onDropPatient }) => {
    const bedSlots = Array.from({ length: capacity }, (_, index) => ({
        bedIndex: index,
        patient: patients[index],
    }));

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: "1fr",
                gap: '4px',
                padding: '4px',
                border: '1px solid var(--color-white)',
            }}
        >
            {bedSlots.map(({ bedIndex, patient }) => (
                <BedSlot
                    key={bedIndex}
                    day={day}
                    roomId={roomId}
                    bedIndex={bedIndex}
                    patient={patient}
                    onDropPatient={onDropPatient}
                />
            ))}
        </div>
    );
};

export default RoomCell;
