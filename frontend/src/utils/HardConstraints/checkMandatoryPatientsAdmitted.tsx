import { InputFile } from "../../types/InputFile";
import { SolutionFile, PatientOutput } from "../../types/SolutionFile";


export function checkMandatoryPatientsAdmitted(inputData: InputFile, solutionData: SolutionFile): string[] {
    const errors: string[] = [];

    // Construimos un mapa para acceder rápidamente a los datos de solución de cada paciente usando su id
    const solutionPatientMap = new Map<string, PatientOutput>();
    solutionData.patients.forEach(patientSol => {
        solutionPatientMap.set(patientSol.id, patientSol);
    });

    // Recorremos todos los pacientes de entrada
    inputData.patients.forEach(patientInput => {
        if (patientInput.mandatory) {
            const patientSol = solutionPatientMap.get(patientInput.id);
            // Se considera no programado si no existe en la solución o si su admission_day es "none"
            if (!patientSol || patientSol.admission_day === "none") {
                errors.push(`Mandatory patient ${patientInput.id} is unscheduled`);
            }
        }
    });

    return errors;
}
