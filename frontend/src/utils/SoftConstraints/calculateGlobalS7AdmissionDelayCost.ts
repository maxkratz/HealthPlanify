import { InputFile } from "../../types/InputFile";
import { SolutionFile } from "../../types/SolutionFile";


export function calculateGlobalS7AdmissionDelayCost(inputData: InputFile, solutionData: SolutionFile): number {
    // Verificación de la existencia de datos.
    if (!inputData || !solutionData) {
        return 0;
    }

    const { weights } = inputData;
    const weightS7 = weights.patient_delay ?? 1;
    let totalDelay = 0;

    // Itera sobre cada paciente de la solución.
    solutionData.patients.forEach(patient => {
        // Sólo se consideran pacientes programados (admission_day diferente de "none").
        if (patient.admission_day !== "none") {
            const admissionDay = Number(patient.admission_day);
            // Calcula el retraso como la diferencia entre el día de admisión y el día de liberación.
            const patientInput = inputData.patients.find((pi) => pi.id === patient.id)!;
            const delay = admissionDay - patientInput.surgery_release_day;
            totalDelay += delay;
        }
    });

    return totalDelay * weightS7;
}
