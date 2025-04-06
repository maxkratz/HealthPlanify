import React from 'react';
import { useData } from '../../../DataContext';
import { PatientFullData } from '../../../types/Combined';

interface PatientDetailProps {
    patientId: string;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({ patientId }) => {
    const { inputData, solutionData } = useData();

    if (!inputData || !solutionData) {
        return <div>Ups, something went wrong! There is no loaded data</div>;
    }

    const patientSolution = solutionData.patients.find((p) => p.id === patientId)!;
    const patientInput = inputData.patients.find((pi) => pi.id === patientId)!;
    const patientFull: PatientFullData = { ...patientSolution, ...patientInput };

    return (
        <div className='flex flex-col gap-2'>
            <h3>{patientId} Patient Details</h3>
            <p><strong>Admission Day:</strong> {patientFull.admission_day}</p>
            <p><strong>Room:</strong> {patientFull.room}</p>
            <p><strong>Operating Theater:</strong> {patientFull.operating_theater}</p>
            <p><strong>Mandatory:</strong> {patientFull.mandatory ? "Yes" : "No"}</p>
            <p><strong>Gender:</strong> {patientFull.gender}</p>
            <p><strong>Age Group:</strong> {patientFull.age_group}</p>
            <p><strong>Length of Stay:</strong> {patientFull.length_of_stay}</p>
            <p><strong>Surgery Release Day:</strong> {patientFull.surgery_release_day}</p>
            <p><strong>Surgery Due Day:</strong> {patientFull.surgery_due_day}</p>
            <p><strong>Surgery Duration:</strong> {patientFull.surgery_duration}</p>
            <p><strong>Surgeon ID:</strong> {patientFull.surgeon_id}</p>
            <p>
                <strong>Incompatible Room IDs:</strong>{" "}
                {patientFull.incompatible_room_ids.join(', ')}
            </p>
            {/* <p>
                <strong>Workload Produced:</strong>{" "}
                {patientFull.workload_produced.join(', ')}
            </p>
            <p>
                <strong>Skill Level Required:</strong>{" "}
                {patientFull.skill_level_required.join(', ')}
            </p> */}
        </div>
    );
};
