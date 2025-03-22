import { ShiftType } from "./types";

export interface SolutionFile {
    patients: PatientOutput[];
    nurses: NurseOutput[];
}

export interface PatientOutput {
    id: string;
    admission_day: number | "none";
    room: string;
    operating_theater: string;
}

interface Assignment {
    day: number;
    shift: ShiftType;
    rooms: string[];
}

interface NurseOutput {
    id: string;
    assignments: Assignment[];
}
