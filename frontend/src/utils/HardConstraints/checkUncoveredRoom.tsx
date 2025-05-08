import { InputFile } from "../../types/InputFile";
import { SolutionFile, PatientOutput } from "../../types/SolutionFile";
import { ShiftType } from "../../types/types";


export function checkUncoveredRoom(
    inputData: InputFile,
    solutionData: SolutionFile
): string[] {
    const errors: string[] = [];

    const days = inputData.days;
    const shiftTypes = inputData.shift_types;

    // Build set of covered combinations: room-day-shift
    const covered = new Set<string>();
    solutionData.nurses.forEach(nurseOut => {
        nurseOut.assignments.forEach(a => {
            const { day, shift, rooms } = a;
            rooms.forEach(roomId => {
                covered.add(`${roomId}|${day}|${shift}`);
            });
        });
    });

    // For each room, day, shift, check if patients present
    inputData.rooms.forEach(room => {
        for (let day = 0; day < days; day++) {
            shiftTypes.forEach((shift: ShiftType) => {
                // Check patients present in this room at this day
                const patientsPresent = solutionData.patients.some(
                    (p: PatientOutput) => {
                        if (p.room !== room.id || p.admission_day === "none") return false;
                        const admDay = p.admission_day as number;
                        const lengthOfStay =
                            inputData.patients.find(pi => pi.id === p.id)?.length_of_stay || 0;
                        return day >= admDay && day < admDay + lengthOfStay;
                    }
                );
                if (patientsPresent && !covered.has(`${room.id}|${day}|${shift}`)) {
                    errors.push(
                        `Room ${room.id} is uncovered: Day ${day}, ${shift}`
                    );
                }
            });
        }
    });

    return errors;
}

