import React from 'react';
import { useParams } from 'react-router-dom';
import { OperatingTheater } from '../../../components/OperatingTheater/OperatingTheater';
import { useData } from '../../../DataContext';
import { PatientFullData } from '../../../types/Combined';

export interface PatientFullDataOperatingTheater extends PatientFullData {
    operatingTheaterAvailability: number; // Not used in OperatingTheater flow, not deleted just in case
}

export const OperatingTheatersList: React.FC = () => {
    const { dayIndex } = useParams();
    const data = useData();
    const dayNumber = Number(dayIndex);
    const operatingTheaters = data.inputData?.operating_theaters || [];

    // Build a list of operating theaters with assigned patients
    const theatersWithAssignments = operatingTheaters.map((ot) => {
        const patientsAssigned = (data.solutionData?.patients.filter((patient) => {
            const patientInput = data.inputData?.patients.find(p => p.id === patient.id);
            if (!patientInput) return false;
            return (
                patient.admission_day === dayNumber &&
                patient.operating_theater === ot.id
            );
        }) || []).map((patient) => {
            const patientInput = data.inputData?.patients.find(p => p.id === patient.id);
            const availableTime = ot.availability[dayNumber];
            return {
                ...patientInput,
                ...patient,
                operatingTheaterAvailability: availableTime
            } as PatientFullDataOperatingTheater;
        });

        const totalTimeAssigned = patientsAssigned.reduce((acc, patient) => acc + patient.surgery_duration, 0);
        const maxAvailableTime = ot.availability[dayNumber];

        return {
            ot,
            patientsAssigned,
            totalTimeAssigned,
            maxAvailableTime,
        };
    }).filter(({ totalTimeAssigned, maxAvailableTime }) => totalTimeAssigned !== 0 && maxAvailableTime !== 0);

    return (
        <div>
            <div className='mb-16'>
                <h1>Operating Theaters List (day {dayNumber})</h1>
            </div>
            {theatersWithAssignments.length > 0 ? (
                <div className="flex items-center justify-center flex-row flex-wrap gap-4">
                    {theatersWithAssignments.map(({ ot, patientsAssigned, totalTimeAssigned }) => (
                        <OperatingTheater
                            key={ot.id}
                            operatingTheaterId={ot.id}
                            patients={patientsAssigned}
                            maxAvailableTime={ot.availability[dayNumber]}
                            totalTimeAssigned={totalTimeAssigned}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center p-8">
                    <p className="text-lg font-medium text-[var(--color-grey)]">There are no open operating theaters this day :c</p>
                </div>
            )}
        </div>
    );
};
