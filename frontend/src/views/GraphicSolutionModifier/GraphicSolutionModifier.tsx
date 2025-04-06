import React from 'react';
import { SolutionGrid } from './SolutionGrid/SolutionGrid';
import styles from './GraphicSolutionModifier.module.scss';
import { PatientDetail } from './PatientDetail/PatientDetail';
import { DayDetail } from './DayDetail/DayDetail';

export const GraphicSolutionModifier = () => {
    const [selectedPatientId, setSelectedPatientId] = React.useState<string | null>(null);
    const [selectedDay, setSelectedDay] = React.useState<number | null>(null);


    const handlePatientClick = (patientId: string) => {
        setSelectedPatientId(patientId);
    };

    const handleDayClick = (day: number) => {
        setSelectedDay(day);
    };

    return (
        <div className={styles.container}>
            <div className={styles.side}>
                <div className='mb-8'>
                    {selectedPatientId && <PatientDetail patientId={selectedPatientId} />}
                </div>
                {selectedDay && <DayDetail day={selectedDay} />}
            </div>

            <div className={styles.center}>
                <SolutionGrid onPatientClick={handlePatientClick} onDayClick={handleDayClick} />
            </div>

            <div className={styles.side}>
                {selectedPatientId && <PatientDetail patientId={selectedPatientId} />}
            </div>
        </div>
    );
};