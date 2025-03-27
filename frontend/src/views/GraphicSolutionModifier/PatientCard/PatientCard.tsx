import React from 'react';
import { useDrag } from 'react-dnd';
import { PatientOutput } from '../../../types/SolutionFile'

interface PatientCardProps {
    patient: PatientOutput;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'PATIENT',
        item: { id: patient.id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [patient]);

    return (
        <div
            ref={drag as any}
            style={{
                opacity: isDragging ? 0.5 : 1,
                border: '1px solid var(--color-white)',
                padding: '4px',
                margin: '2px',
                backgroundColor: 'var(--color-rose)',
                cursor: 'move',
                textAlign: 'center',
            }}
        >
            {patient.id}
        </div>
    );
};

export default PatientCard;
