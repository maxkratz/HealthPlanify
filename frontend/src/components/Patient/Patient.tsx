import React from 'react';
import PatientStyle from './Patient.module.scss';

export type PatientComponentProps = {
    patientId: string;
    surgeryReleaseDay: number;
    surgeryDueDay: number;
    admissionDay: number;
    delay: number;
};

export const Patient: React.FC<PatientComponentProps> = ({
    patientId,
    surgeryReleaseDay,
    surgeryDueDay,
    admissionDay,
    delay,
    ...props
}) => {

    const totalDays = surgeryDueDay - surgeryReleaseDay
    let modifier = 'free';
    if (!isFinite(delay)) {
        modifier = 'overfull';
    } else if (delay == totalDays && surgeryReleaseDay != surgeryDueDay) {
        modifier = 'full';
    } else if (delay >= totalDays * 0.5 && surgeryReleaseDay != surgeryDueDay) {
        modifier = 'half';
    }
    const containerClassName = `${PatientStyle.container} ${PatientStyle[`container--${modifier}`]}`;

    return (
        <div className={containerClassName}>
            <span {...props}><strong>Patient: </strong>{patientId}</span>
            <span {...props}><strong>Release Day: </strong>{surgeryReleaseDay}</span>
            {!isFinite(delay) ? (
                <span {...props}><strong>Not Scheduled</strong></span>
            ) : (
                <>
                    <span {...props}><strong>Due Day: </strong>{surgeryDueDay}</span>
                    <span {...props}><strong>Admission Day: </strong>{admissionDay}</span>
                    <span {...props}><strong>Delay: </strong>{delay}</span>
                </>
            )}
        </div>
    );

};
