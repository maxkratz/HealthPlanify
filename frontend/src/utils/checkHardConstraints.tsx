import { InputFile } from "../types/InputFile";
import { SolutionFile } from "../types/SolutionFile";

import { checkRoomGenderMix } from "./checkRoomGenderMix";
import { checkPatientRoomCompatibility } from "./checkPatientRoomCompatibility";
import { checkRoomCapacity } from "./checkRoomCapacity";
import { checkSurgeonOvertime } from "./checkSurgeonOvertime";
import { checkOperatingTheaterOvertime } from "./checkOperatingTheaterOvertime";
import { checkMandatoryPatientsAdmitted } from "./checkMandatoryPatientsAdmitted";
import { checkAdmissionDay } from "./checkAdmissionDay";

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

    return errors.flat();
}