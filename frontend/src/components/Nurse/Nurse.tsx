import React from 'react';
import NurseStyle from './Nurse.module.scss';

type AssignedPatient = {
  patientId: string;
  workload: number;
  requiredSkill: number;
};

export type NurseComponentProps = {
  nurseId: string;
  skillLevel: number;
  maxLoad: number;
  assignedPatients: AssignedPatient[];
};

export const Nurse: React.FC<NurseComponentProps> = ({
  nurseId,
  skillLevel,
  maxLoad,
  assignedPatients,
  ...props
}) => {
  // Sumar la carga de trabajo real de todos los pacientes asignados
  const actualLoad = assignedPatients.reduce((sum, patient) => sum + patient.workload, 0);

  // Obtener el nivel de habilidad requerido máximo entre los pacientes asignados
  const maxRequiredSkill = assignedPatients.reduce((max, patient) => {
    return patient.requiredSkill > max ? patient.requiredSkill : max;
  }, 0);

  return (
    <div className={NurseStyle.container}>
      <h2 {...props}>Nurse: {nurseId}</h2>
      <span {...props}>Skill Level: {skillLevel}</span>
      <span {...props}>Max Load: {maxLoad}</span>
      <span {...props}>Actual Load: {actualLoad}</span>
      <span {...props}>
        Required Skill (max): {maxRequiredSkill}
      </span>
      {assignedPatients.length > 0 && (
        <div className={NurseStyle.assignedPatients}>
          <h2>Assigned Patients:</h2>
          <ul>
            {assignedPatients.map(patient => (
              <li key={patient.patientId}>
                ID: {patient.patientId} - Workload: {patient.workload} - Required Skill: {patient.requiredSkill}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
