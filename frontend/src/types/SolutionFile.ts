import { ShiftType } from "./types";

// Archivo de solución completo
export interface SolutionFile {
  patients: PatientOutput[];
  nurses: NurseOutput[];
}

// Información de solución para cada paciente
export interface PatientOutput {
  id: string;
  admission_day: number;
  room: string;
  operating_theater: string;
}

// Representa una asignación (turno y salas) para una enfermera
interface Assignment {
  day: number;
  shift: ShiftType;
  rooms: string[];
}

// Información de solución para cada enfermera
interface NurseOutput {
  id: string;
  assignments: Assignment[];
}
