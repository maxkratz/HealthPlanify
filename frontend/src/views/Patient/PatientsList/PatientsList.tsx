import React, { useState } from 'react';
import { useData } from "../../../DataContext";
import { PatientFullData } from '../../../types/Combined';
import { Patient } from '../../../components/Patient';
import { SortButton } from '../../../components/SortButton';
import { calculateGlobalS7AdmissionDelayCost } from '../../../utils/SoftConstraints/calculateGlobalS7AdmissionDelayCost';
import { calculateGlobalS8UnscheduledPatientsCost } from '../../../utils/SoftConstraints/calculateGlobalS8UnscheduledPatientsCost';

type SortCriteria = "surgeryReleaseDay" | "surgeryDueDay" | "admissionDay" | "delay";

export const PatientsList: React.FC = () => {
    const data = useData();
    const { inputData, solutionData } = data;

    const [sortCriteria, setSortCriteria] = useState<SortCriteria>("delay");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const handleSort = (criteria: SortCriteria) => {
        if (criteria === sortCriteria) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortCriteria(criteria);
            setSortDirection("desc");
        }
    };

    if (!inputData || !solutionData) {
        return <div>Ups, something went wrong! There is no loaded data</div>;
    }

    const patientsFullData: PatientFullData[] = solutionData.patients
        .map((patient) => {
            const patientInput = inputData.patients.find(p => p.id === patient.id);
            return patientInput ? { ...patientInput, ...patient } : undefined;
        })
        .filter((p): p is PatientFullData => p !== undefined);

    // Ordenación de pacientes según el criterio seleccionado.
    const sortedPatients = [...patientsFullData].sort((a, b) => {
        // Para cada paciente se calculan los valores:
        const admissionA = a.admission_day === "none" ? Infinity : Number(a.admission_day);
        const admissionB = b.admission_day === "none" ? Infinity : Number(b.admission_day);
        const dueA = a.surgery_due_day ?? Infinity;
        const dueB = b.surgery_due_day ?? Infinity;
        const delayA = admissionA === Infinity ? Infinity : admissionA - a.surgery_release_day;
        const delayB = admissionB === Infinity ? Infinity : admissionB - b.surgery_release_day;

        let diff = 0;
        if (sortCriteria === "surgeryReleaseDay") {
            diff = a.surgery_release_day - b.surgery_release_day;
        } else if (sortCriteria === "surgeryDueDay") {
            diff = dueA - dueB;
        } else if (sortCriteria === "admissionDay") {
            diff = admissionA - admissionB;
        } else if (sortCriteria === "delay") {
            diff = delayA - delayB;
        }
        return sortDirection === "asc" ? diff : -diff;
    });

    const { weights } = inputData;
    const globalS7Weighted = calculateGlobalS7AdmissionDelayCost(inputData, solutionData);
    const globalS8Weighted = calculateGlobalS8UnscheduledPatientsCost(inputData, solutionData);

    return (
        <div>
            <div className="mb-16">
                <h1>Patients List</h1>
            </div>

            <div className='mb-16'>
                <h2>Global Costs of Restrictions</h2>
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <span>
                        <strong>S7 - Admission delay</strong>
                    </span> (Weight: {weights.patient_delay}): {globalS7Weighted}
                </div>
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <span>
                        <strong>S8 - Unscheduled patients</strong>
                    </span> (Weight: {weights.unscheduled_optional}): {globalS8Weighted}
                </div>
            </div>

            <div className="mb-16 flex items-center justify-center flex-row gap-4">
                <SortButton
                    onClick={() => handleSort("surgeryReleaseDay")}
                    active={sortCriteria === "surgeryReleaseDay"}
                    label="Sort by Release Day"
                    sortDirection={sortCriteria === "surgeryReleaseDay" ? sortDirection : undefined}
                />
                <SortButton
                    onClick={() => handleSort("surgeryDueDay")}
                    active={sortCriteria === "surgeryDueDay"}
                    label="Sort by Due Day"
                    sortDirection={sortCriteria === "surgeryDueDay" ? sortDirection : undefined}
                />
                <SortButton
                    onClick={() => handleSort("admissionDay")}
                    active={sortCriteria === "admissionDay"}
                    label="Sort by Admission Day"
                    sortDirection={sortCriteria === "admissionDay" ? sortDirection : undefined}
                />
                <SortButton
                    onClick={() => handleSort("delay")}
                    active={sortCriteria === "delay"}
                    label="Sort by Delay"
                    sortDirection={sortCriteria === "delay" ? sortDirection : undefined}
                />
            </div>

            <div className="flex items-center justify-center flex-row flex-wrap gap-4">
                {sortedPatients.map((patient) => {
                    // Para pacientes opcionales puede ocurrir que no se tenga defined surgery_due_day
                    const surgeryDueDay = patient.surgery_due_day ?? Infinity;
                    // Si admission_day es "none", se representa como infinito positivo.
                    const admissionDay = patient.admission_day === "none" ? Infinity : Number(patient.admission_day);
                    // Si el paciente no está programado (admissionDay Infinity), delay es Infinity.
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

export default PatientsList;
