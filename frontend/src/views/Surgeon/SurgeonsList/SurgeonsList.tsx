import React from 'react';
import { useParams } from 'react-router-dom';
import { Surgeon } from '../../../components/Surgeon/Surgeon';
import { useData } from '../../../DataContext';
import { PatientFullData } from '../../../types/Combined';

export interface PatientFullDataSurgeon extends PatientFullData {
    operatingTheaterAvailability: number; // Not used in Surgeon flow, not deleted just in case
}

export const SurgeonsList: React.FC = () => {
    const { dayIndex } = useParams();
    const data = useData();
    const dayNumber = Number(dayIndex);
    const surgeons = data.inputData?.surgeons || [];

    // Build a list of surgeons with assigned patients
    const surgeonsWithAssignments = surgeons.map((surgeon) => {
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

        const totalTimeAssigned = patientsAssigned.reduce((acc, patient) => acc + patient.surgery_duration, 0);
        const maxSurgeryTime = surgeon.max_surgery_time[dayNumber];

        return {
            surgeon,
            patientsAssigned,
            totalTimeAssigned,
            maxSurgeryTime,
        };
    })
        .filter(({ totalTimeAssigned, maxSurgeryTime }) => totalTimeAssigned !== 0 && maxSurgeryTime !== 0);

    return (
        <div>
            <div className='mb-16'>
                <h1>Surgeons List (day {dayNumber})</h1>
            </div>
            {surgeonsWithAssignments.length > 0 ? (
                <div className="flex items-center justify-center flex-row flex-wrap gap-4">
                    {surgeonsWithAssignments.map(({ surgeon, patientsAssigned, totalTimeAssigned }) => (
                        <Surgeon
                            key={surgeon.id}
                            surgeonId={surgeon.id}
                            patients={patientsAssigned}
                            maxSurgeryTime={surgeon.max_surgery_time[dayNumber]}
                            totalTimeAssigned={totalTimeAssigned}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center p-8">
                    <p className="text-lg font-medium text-gray-600">There are no surgeons assigned this day :c</p>
                </div>
            )}
        </div>
    );
};
