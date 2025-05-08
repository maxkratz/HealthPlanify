import { InputFile } from "../types/InputFile";
import { SolutionFile } from "../types/SolutionFile";

import { checkRoomGenderMix } from "./HardConstraints/checkRoomGenderMix";
import { checkPatientRoomCompatibility } from "./HardConstraints/checkPatientRoomCompatibility";
import { checkRoomCapacity } from "./HardConstraints/checkRoomCapacity";
import { checkSurgeonOvertime } from "./HardConstraints/checkSurgeonOvertime";
import { checkOperatingTheaterOvertime } from "./HardConstraints/checkOperatingTheaterOvertime";
import { checkMandatoryPatientsAdmitted } from "./HardConstraints/checkMandatoryPatientsAdmitted";
import { checkAdmissionDay } from "./HardConstraints/checkAdmissionDay";
import { checkUncoveredRoom } from "./HardConstraints/checkUncoveredRoom";

export function checkHardConstraints(inputData: InputFile, solutionData: SolutionFile): string[] {
    const errors: string[] = [];

    // H1
    errors.push(...checkRoomGenderMix(inputData, solutionData));
    // H2
    errors.push(...checkPatientRoomCompatibility(inputData, solutionData));
    // H7
    errors.push(...checkRoomCapacity(inputData, solutionData));
    // H3
    errors.push(...checkSurgeonOvertime(inputData, solutionData));
    // H4
    errors.push(...checkOperatingTheaterOvertime(inputData, solutionData));
    // H5
    errors.push(...checkMandatoryPatientsAdmitted(inputData, solutionData));
    // H6
    errors.push(...checkAdmissionDay(inputData, solutionData));

    // Nurse Uncovered Rooms
    errors.push(...checkUncoveredRoom(inputData, solutionData));

    return errors.flat();
}