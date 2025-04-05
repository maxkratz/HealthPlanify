import React from 'react';
import { useDrag } from 'react-dnd';
import { PatientFullData } from '../../../types/Combined';

interface PatientCardProps {
    patient: PatientFullData;
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
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'PATIENT',
        item: { id: patient.id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [patient]);

    const backgroundColor = patient.gender === 'A' ? 'var(--color-blue)' : 'var(--color-rose)';
    const borderStyle = patient.mandatory ? 'solid' : 'dashed';

    const handleClick = () => {
        if (onClick) {
            onClick(patient.id);
        }
    };

    return (
        <div
            ref={drag as any}
            style={{
                opacity: isDragging ? 0.5 : 1,
                border: `3px ${borderStyle} var(--color-white)`,
                padding: '4px',
                margin: '2px',
                backgroundColor,
                cursor: 'move',
                textAlign: 'center',
            }}
            onClick={handleClick}
        >
            {formatPatientId(patient.id, patient.age_group)}
        </div>
    );
};

export default PatientCard;
