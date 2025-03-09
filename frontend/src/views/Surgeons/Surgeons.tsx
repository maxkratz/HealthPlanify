import React from 'react';
import { useParams } from 'react-router-dom';
import { Surgeon } from '../../components/Surgeon/Surgeon';
import { useData } from '../../DataContext';
import { PatientFullData } from '../../types/Combined';

export interface PatientFullDataSurgeon extends PatientFullData {
    operatingTheaterAvailability: number;
}

export const Surgeons: React.FC = () => {
    const { dayIndex } = useParams();
    const data = useData();
    const dayNumber = Number(dayIndex);
    const surgeons = data.inputData?.surgeons || [];

    return (
        <div className="flex items-center justify-center flex-row flex-wrap m-4 gap-4">
            {surgeons.map((surgeon) => {
                // Filtra los pacientes asignados a este cirujano en el día (sólo se realiza la cirugía en el día de admisión)
                const patientsAssigned = (data.solutionData?.patients.filter((patient) => {
                    const patientInput = data.inputData?.patients.find(p => p.id === patient.id);
                    if (!patientInput) return false;
                    return (
                        patient.admission_day === dayNumber &&
                        patientInput.surgeon_id === surgeon.id
                    );
                }) || []).map((patient) => {
                    const patientInput = data.inputData?.patients.find(p => p.id === patient.id);
                    const theater = data.inputData?.operating_theaters.find(
                        ot => ot.id === patient.operating_theater
                    );
                    const operatingTheaterAvailability = theater ? theater.availability[dayNumber] : 0;
                    return { ...patientInput, ...patient, operatingTheaterAvailability } as PatientFullDataSurgeon;
                });

                return (
                    <Surgeon
                        key={surgeon.id}
                        surgeonId={surgeon.id}
                        patients={patientsAssigned}
                        maxSurgeryTime={surgeon.max_surgery_time[dayNumber]}
                    />
                );
            })}
        </div>
    );
};
