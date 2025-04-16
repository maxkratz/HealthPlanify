import { InputFile } from "../types/InputFile";
import { SolutionFile } from "../types/SolutionFile";

import { calculateGlobalS1AgeDifference } from "./SoftConstraints/calculateGlobalS1AgeDifference";
import { calculateNurseGlobalConstraints } from "./SoftConstraints/calculateNurseSoftGlobalConstraints";
import { calculateGlobalS5OperatingTheaterCost } from "./SoftConstraints/calculateGlobalS5OperatingTheaterCost";
import { calculateGlobalS6SurgeonTransferCost } from "./SoftConstraints/calculateGlobalS6SurgeonTransferCost";
import { calculateGlobalS7AdmissionDelayCost } from "./SoftConstraints/calculateGlobalS7AdmissionDelayCost";
import { calculateGlobalS8UnscheduledPatientsCost } from "./SoftConstraints/calculateGlobalS8UnscheduledPatientsCost";


export function checkSoftConstraintsCost(inputData: InputFile, solutionData: SolutionFile): number {
    let totalCost = 0;

    totalCost += calculateGlobalS1AgeDifference(inputData, solutionData);

    const nursesCost = calculateNurseGlobalConstraints(inputData, solutionData);
    totalCost += nursesCost.globalS2Weighted;
    totalCost += nursesCost.globalS3Weighted;
    totalCost += nursesCost.globalS4Weighted;

    totalCost += calculateGlobalS5OperatingTheaterCost(inputData, solutionData).costS5;

    totalCost += calculateGlobalS6SurgeonTransferCost(inputData, solutionData).costS6;

    totalCost += calculateGlobalS7AdmissionDelayCost(inputData, solutionData);

    totalCost += calculateGlobalS8UnscheduledPatientsCost(inputData, solutionData);

    return totalCost;
}