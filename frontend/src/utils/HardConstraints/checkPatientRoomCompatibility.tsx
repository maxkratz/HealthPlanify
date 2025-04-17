import { InputFile, PatientInput } from "../../types/InputFile";
import { SolutionFile } from "../../types/SolutionFile";


export function checkPatientRoomCompatibility(inputData: InputFile, solutionData: SolutionFile): string[] {
    const errors: string[] = [];

    // Construimos un mapa para acceder rápidamente a los datos de cada paciente (datos de entrada)
    const patientInputsMap = new Map<string, PatientInput>();
    inputData.patients.forEach(patient => {
        patientInputsMap.set(patient.id, patient);
    });

    // Recorremos cada paciente de la solución
    solutionData.patients.forEach(patientSol => {
        // Si el paciente no ha sido admitido, se omite
        if (patientSol.admission_day === "none") return;

        // Obtenemos los datos de entrada del paciente
        const patientInput = patientInputsMap.get(patientSol.id);
        if (!patientInput) {
            // Si no se encuentran los datos, se podría registrar un error o simplemente omitirlo.
            return;
        }

        // Si la sala asignada se encuentra en la lista de salas incompatibles del paciente, se registra la violación
        if (patientInput.incompatible_room_ids.includes(patientSol.room)) {
            errors.push(`Room ${patientSol.room} is incompatible with patient ${patientSol.id}`);
        }
    });

    return errors;
}
