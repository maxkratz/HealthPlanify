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

    return (
        <div className="flex items-center justify-center flex-row flex-wrap gap-4">
            {operatingTheaters.map((ot) => {
                const patientsAssigned = (data.solutionData?.patients.filter((patient) => {
                    const patientInput = data.inputData?.patients.find(p => p.id === patient.id);
                    if (!patientInput) return false;
                    return (
                        patient.admission_day === dayNumber &&
                        patient.operating_theater === ot.id
                    );
                }) || []).map((patient) => {
                    const patientInput = data.inputData?.patients.find(p => p.id === patient.id);
                    const maxAvailableTime = ot.availability[dayNumber];
                    return { 
                        ...patientInput, 
                        ...patient, 
                        operatingTheaterAvailability: maxAvailableTime 
                    } as PatientFullDataOperatingTheater;
                });

                return (
                    <OperatingTheater
                        key={ot.id}
                        operatingTheaterId={ot.id}
                        patients={patientsAssigned}
                        maxAvailableTime={ot.availability[dayNumber]}
                    />
                );
            })}
        </div>
    );
};
