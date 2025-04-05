import React from 'react';
import { SolutionGrid } from './SolutionGrid/SolutionGrid';
import styles from './GraphicSolutionModifier.module.scss';
import { PatientDetail } from './PatientDetail/PatientDetail';

export const GraphicSolutionModifier = () => {
    const [selectedPatientId, setSelectedPatientId] = React.useState<string | null>(null);

    const handlePatientClick = (patientId: string) => {
        setSelectedPatientId(patientId);
    };

    return (
        <div className={styles.container}>
            <div className={styles.side}>
                {selectedPatientId && <PatientDetail patientId={selectedPatientId} />}
            </div>

            <div className={styles.center}>
                <SolutionGrid onPatientClick={handlePatientClick} />
            </div>

            <div className={styles.side}>
                {selectedPatientId && <PatientDetail patientId={selectedPatientId} />}
            </div>
        </div>
    );
};