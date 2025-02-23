import { ShiftType } from "./types";

// Representa el header y los datos generales del input
export interface InputFile {
  days: number;
  skill_levels: number;
  shift_types: ShiftType[]; // p.ej. "early", "late", "night"
  age_groups: string[];      // p.ej. "infant", "adult", "elderly"
  weights: Weights;
  nurses: Nurse[];
  surgeons: Surgeon[];
  operating_theaters: OperatingTheater[];
  rooms: Room[];
  occupants: Occupant[];
  patients: PatientInput[];
}

// Representa la sección de pesos en el header
interface Weights {
  room_mixed_age: number;
  room_nurse_skill: number;
  continuity_of_care: number;
  nurse_eccessive_workload: number;
  open_operating_theater: number;
  surgeon_transfer: number;
  patient_delay: number;
  unscheduled_optional: number;
}

// Representa a un turno de trabajo para una enfermera
interface WorkingShift {
  day: number;
  shift: ShiftType;
  max_load: number;
}

// Datos de cada enfermera
interface Nurse {
  id: string;
  skill_level: number;
  working_shifts: WorkingShift[];
}

// Datos de cada cirujano
interface Surgeon {
  id: string;
  max_surgery_time: number[]; // Vector de tiempos máximos por día
}

// Datos de cada quirófano (operating theater)
interface OperatingTheater {
  id: string;
  availability: number[]; // Vector de disponibilidad (en minutos) por día
}

// Datos de cada sala (room)
interface Room {
  id: string;
  capacity: number;
}

// Datos de cada ocupante (paciente que ya está ingresado)
interface Occupant {
  id: string;
  gender: string;        // Podrías restringirlo si conoces los valores, por ejemplo "A" | "B"
  age_group: string;
  length_of_stay: number;
  workload_produced: number[];
  skill_level_required: number[];
  room_id: string;
}

// Datos de cada paciente a programar
interface PatientInput {
  id: string;
  mandatory: boolean;
  gender: string;
  age_group: string;
  length_of_stay: number;
  surgery_release_day: number;
  surgery_due_day: number;
  surgery_duration: number;
  surgeon_id: string;
  incompatible_room_ids: string[];
  workload_produced: number[];
  skill_level_required: number[];
}
