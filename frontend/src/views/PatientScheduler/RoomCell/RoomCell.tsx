import React from 'react';
import { useDrop } from 'react-dnd';
import PatientCard from '../PatientCard/PatientCard';
import { RoomPerson } from '../PatientScheduler/PatientScheduler';

interface BedSlotProps {
    day: number | "none";
    roomId: string;
    bedIndex: number;
    patient?: RoomPerson;
    onDropPatient: (patientId: string, newDay: number | "none", newRoom: string, bedIndex: number) => void;
    onPatientClick: (patientId: string) => void;
}

const BedSlot: React.FC<BedSlotProps> = ({ day, roomId, bedIndex, patient, onDropPatient, onPatientClick }) => {
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
                minHeight: '2.75rem',
                minWidth: '4.5rem',
                border: isOver ? '0.125rem dashed var(--color-blue)' : '0.063rem solid var(--color-black)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {patient ? <PatientCard patient={patient} onClick={onPatientClick} /> : null}
        </div>
    );
};

interface RoomCellProps {
    day: number | "none";
    roomId: string;
    capacity: number;
    patients: RoomPerson[];
    onDropPatient: (patientId: string, newDay: number | "none", newRoom: string, bedIndex: number) => void;
    onPatientClick: (patientId: string) => void;
}

const RoomCell: React.FC<RoomCellProps> = ({ day, roomId, capacity, patients, onDropPatient, onPatientClick }) => {
    const bedSlots = Array.from({ length: capacity }, (_, index) => ({
        bedIndex: index,
        patient: patients[index],
    }));

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: "1fr",
                gap: '0.25rem',
                padding: '0.25rem',
                border: '0.063rem solid var(--color-black)',
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
                    onPatientClick={onPatientClick}
                />
            ))}
        </div>
    );
};

export default RoomCell;
