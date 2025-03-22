import React from 'react';
import { useData } from "../../../DataContext";
import { PatientFullData } from '../../../types/Combined';
import { Patient } from '../../../components/Patient';

export const PatientsList: React.FC = () => {
    const data = useData();
    const { inputData, solutionData } = data;

    if (!inputData || !solutionData) {
        return <div>Loading...</div>;
    }

    const patientsFullData: PatientFullData[] = solutionData.patients
        .map((patient) => {
            const patientInput = inputData.patients.find(p => p.id === patient.id);
            return patientInput ? { ...patientInput, ...patient } : undefined;
        })
        .filter((p): p is PatientFullData => p !== undefined);

    return (
        <div>
            <div className="mb-16">
                <h1>Patients List</h1>
            </div>

            <div className="flex items-center justify-center flex-row flex-wrap gap-4">
                {patientsFullData.map((patient) => {
                    // Optional patient
                    const surgeryDueDay = patient.surgery_due_day ?? Infinity;
                    // Patient not scheduled
                    const admissionDay = patient.admission_day === "none" ? Infinity : Number(patient.admission_day);
                    // If patient is not scheduled, delay is infinite
                    const delay = admissionDay === Infinity ? Infinity : admissionDay - patient.surgery_release_day;

                    return (
                        <Patient
                            key={patient.id}
                            patientId={patient.id}
                            surgeryReleaseDay={patient.surgery_release_day}
                            surgeryDueDay={surgeryDueDay}
                            admissionDay={admissionDay}
                            delay={delay}
                        />
                    );
                })}
            </div>
        </div>
    );
};
