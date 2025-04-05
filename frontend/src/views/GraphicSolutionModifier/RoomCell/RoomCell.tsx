import React from 'react';
import { useDrop } from 'react-dnd';
import { PatientFullData } from '../../../types/Combined';
import PatientCard from '../PatientCard/PatientCard';

interface RoomCellProps {
    day: number;
    roomId: string;
    patients: PatientFullData[];
    onDropPatient: (patientId: string, newDay: number, newRoom: string) => void;
}

const RoomCell: React.FC<RoomCellProps> = ({ day, roomId, patients, onDropPatient }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'PATIENT',
        drop: (item: { id: string }) => {
            onDropPatient(item.id, day, roomId);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [day, roomId, onDropPatient]);

    return (
        <div
            ref={drop as any}
            style={{
                minHeight: '50px',
                minWidth: '50px',
                padding: '4px',
                border: isOver ? '3px dashed var(--color-rose)' : '1px solid var(--color-white)',
            }}
        >
            {patients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
            ))}
        </div>
    );
};

export default RoomCell;
