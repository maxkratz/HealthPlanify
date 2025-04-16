import { InputFile } from "../../types/InputFile";
import { SolutionFile } from "../../types/SolutionFile";


export function calculateGlobalS8UnscheduledPatientsCost(
    inputData: InputFile,
    solutionData: SolutionFile
): number {
    if (!inputData || !solutionData) {
        return 0;
    }

    const weightS8 = inputData.weights.unscheduled_optional ?? 1;

    const unscheduledCount = inputData.patients.filter(patient =>
        !patient.mandatory &&
        // Se asume que el paciente siempre existe en la solución.
        solutionData.patients.find(p => p.id === patient.id)!.admission_day === "none"
    ).length;

    return unscheduledCount * weightS8;
}
