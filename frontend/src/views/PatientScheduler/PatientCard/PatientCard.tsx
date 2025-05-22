import React from 'react';
import { useDrag } from 'react-dnd';
import { RoomPerson } from '../PatientScheduler/PatientScheduler'

interface PatientCardProps {
    patient: RoomPerson;
    onClick?: (patientId: string) => void;
}

const formatPatientId = (id: string, ageGroup: string): string => {
    const numericId = id.startsWith('p') ? id.slice(1) : id;
    let ageLetter = '';
    switch (ageGroup) {
        case "infant":
            ageLetter = "i";
            break;
        case "adult":
            ageLetter = "a";
            break;
        case "elderly":
            ageLetter = "e";
            break;
        default:
            ageLetter = "";
    }
    return `${numericId} (${ageLetter})`;
};

const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
    const isInteractive = patient.roomOccupantType === "admission";

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'PATIENT',
        item: { id: patient.id },
        canDrag: isInteractive,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [patient, isInteractive]);

    const borderStyle = patient.roomOccupantType === "occupant"
        ? "none"
        : (('mandatory' in patient && patient.mandatory) ? "solid" : "dashed");

    let finalOpacity = isInteractive ? (isDragging ? 0.4 : 1) : 0.4;
    if (patient.roomOccupantType === "occupant") {
        finalOpacity = 0.7;
    }

    const handleClick = () => {
        if (isInteractive && onClick) {
            onClick(patient.id);
        }
    };

    return (
        <div
            ref={drag as any}
            style={{
                color: 'var(--color-white)',
                opacity: finalOpacity,
                border: `0.188rem ${borderStyle} var(--color-black)`,
                padding: '0.25rem',
                margin: '0.125rem',
                backgroundColor: patient.gender === 'A' ? 'var(--color-legend-blue)' : 'var(--color-legend-rose)',
                cursor: isInteractive ? 'move' : 'default',
                textAlign: 'center',
                minWidth: '4rem',
            }}
            onClick={handleClick}
        >
            {formatPatientId(patient.id, patient.age_group)}
        </div>
    );
};

export default PatientCard;
