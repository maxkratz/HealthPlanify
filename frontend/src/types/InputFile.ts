import { ShiftType } from "./types";
import { AgeGroup } from "./types";
import { Gender } from "./types";

export interface InputFile {
    days: number;
    skill_levels: number;
    shift_types: ShiftType[]; // p.ej. "early", "late", "night"
    age_groups: AgeGroup[];      // p.ej. "infant", "adult", "elderly"
    weights: Weights;
    nurses: Nurse[];
    surgeons: Surgeon[];
    operating_theaters: OperatingTheater[];
    rooms: Room[];
    occupants: Occupant[];
    patients: PatientInput[];
}

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

interface WorkingShift {
    day: number;
    shift: ShiftType;
    max_load: number;
}

interface Nurse {
    id: string;
    skill_level: number;
    working_shifts: WorkingShift[];
}

interface Surgeon {
    id: string;
    max_surgery_time: number[]; // Vector de tiempos máximos por día
}

interface OperatingTheater {
    id: string;
    availability: number[]; // Vector de disponibilidad (en minutos) por día
}

interface Room {
    id: string;
    capacity: number;
}

export interface Occupant {
    id: string;
    gender: Gender;        // p.ej. "A" | "B"
    age_group: string;
    length_of_stay: number;
    workload_produced: number[];
    skill_level_required: number[];
    room_id: string;
}

export interface PatientInput {
    id: string;
    mandatory: boolean;
    gender: string;
    age_group: string;
    length_of_stay: number;
    surgery_release_day: number;
    surgery_due_day?: number;
    surgery_duration: number;
    surgeon_id: string;
    incompatible_room_ids: string[];
    workload_produced: number[];
    skill_level_required: number[];
}
