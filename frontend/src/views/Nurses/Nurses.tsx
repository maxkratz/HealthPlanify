import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Nurse } from '../../components/Nurse/Nurse';
import { useData } from "../../DataContext";

type AssignedPatient = {
    patientId: string;
    workload: number;
    requiredSkill: number;
};

export const Nurses: React.FC = () => {
    const { branch, dayIndex, shiftType } = useParams<{ branch: string, dayIndex: string, shiftType: string }>();
    const data = useData();
    const dayNumber = Number(dayIndex);

    // Mapeo para convertir el turno a un índice ordinal: early=0, late=1, night=2
    const shiftOrder: Record<string, number> = { early: 0, late: 1, night: 2 };

    // Filtramos las enfermeras que tienen asignado el turno (working_shift) para el día y turno actuales
    const availableNurses = data.inputData?.nurses.filter(nurse =>
        nurse.working_shifts.some(ws => ws.day === dayNumber && ws.shift === shiftType)
    ) || [];

    return (
        <div className="flex items-center justify-center flex-row flex-wrap m-4 gap-4">
            {availableNurses.map(nurse => {
                // Obtenemos el turno correspondiente en el input para extraer el max_load
                const workingShift = nurse.working_shifts.find(ws => ws.day === dayNumber && ws.shift === shiftType);
                const maxLoad = workingShift ? workingShift.max_load : 0;

                // Buscamos en solutionData la asignación de esta enfermera para el día y turno actuales
                const nurseSolution = data.solutionData?.nurses.find(n => n.id === nurse.id);
                const assignment = nurseSolution?.assignments.find(a => a.day === dayNumber && a.shift === shiftType);
                const assignedRooms = assignment ? assignment.rooms : [];

                // Relacionamos la enfermera con sus pacientes:
                // Filtramos de solutionData los pacientes que:
                // 1. Tengan admission_day (numérico) y estén presentes en el día actual.
                // 2. Su room coincida con alguna de las rooms asignadas a la enfermera.
                const assignedPatients = (data.solutionData?.patients || []).filter(patient => {
                    if (typeof patient.admission_day !== 'number') return false;
                    if (patient.admission_day > dayNumber) return false;
                    // Buscamos el paciente en el input para obtener length_of_stay
                    const inputPatient = data.inputData?.patients.find(p => p.id === patient.id);
                    if (!inputPatient) return false;
                    if (dayNumber >= patient.admission_day + inputPatient.length_of_stay) return false;
                    return assignedRooms.includes(patient.room);
                }).map(patient => {
                    const inputPatient = data.inputData?.patients.find(p => p.id === patient.id);
                    if (!inputPatient) return null;
                    // Calculamos el índice para el turno dentro del vector del paciente.
                    // El índice se calcula como:
                    //   (dayNumber - admission_day) * 3 + (shift ordinal)
                    const shiftOrdinal = shiftType ? shiftOrder[shiftType] : 0;
                    const dayOffset = dayNumber - patient.admission_day;
                    const shiftIndex = dayOffset * 3 + shiftOrdinal;
                    const workload = inputPatient.workload_produced[shiftIndex] ?? 0;
                    const requiredSkill = inputPatient.skill_level_required[shiftIndex] ?? 0;
                    return {
                        patientId: patient.id,
                        workload,
                        requiredSkill
                    } as AssignedPatient;
                }).filter(Boolean) as AssignedPatient[];

                const nurseData = {
                    nurseId: nurse.id,
                    skillLevel: nurse.skill_level,
                    maxLoad,
                    assignedPatients
                };

                return (
                    <Link
                        key={nurse.id}
                        to={`/FirstElection/${branch}/Calendar/${dayIndex}/Shifts/${shiftType}/Nurses/${nurse.id}`}
                        state={{nurseData}} // Necessary for NurseDetails
                    >
                        <Nurse
                            nurseId={nurse.id}
                            skillLevel={nurse.skill_level}
                            maxLoad={maxLoad}
                            assignedPatients={assignedPatients}
                        />
                    </Link>
                );
            })}
        </div>
    );
};
