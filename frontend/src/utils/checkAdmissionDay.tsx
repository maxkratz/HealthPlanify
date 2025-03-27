import { InputFile, PatientInput } from "../types/InputFile";
import { SolutionFile } from "../types/SolutionFile";

export function checkAdmissionDay(inputData: InputFile, solutionData: SolutionFile): string[] {
    const errors: string[] = [];

    // Mapa para acceder rápidamente a los datos de entrada de cada paciente
    const patientInputMap = new Map<string, PatientInput>();
    inputData.patients.forEach(patient => {
        patientInputMap.set(patient.id, patient);
    });

    // Recorremos cada paciente del archivo de solución
    solutionData.patients.forEach(patientSol => {
        // Solo se verifica para pacientes admitidos (excluimos "none")
        if (patientSol.admission_day === "none") return;
        const admissionDay = patientSol.admission_day as number;
        const patientInput = patientInputMap.get(patientSol.id);
        if (!patientInput) return;

        const releaseDay = patientInput.surgery_release_day;
        // Verificamos que el día de admisión no sea anterior al release day.
        if (admissionDay < releaseDay) {
            errors.push(`Patient ${patientSol.id} is admitted at ${admissionDay} before the release date ${releaseDay}`);
        }

        // Para pacientes obligatorios, se debe verificar también que no se supere el due day.
        if (patientInput.mandatory) {
            const dueDay = patientInput.surgery_due_day!;
            if (admissionDay > dueDay) {
                errors.push(`Patient ${patientSol.id} is admitted at ${admissionDay} after the last possible date ${dueDay}`);
            }
        }
    });

    return errors;
}
