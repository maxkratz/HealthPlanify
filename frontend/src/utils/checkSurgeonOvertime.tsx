import { InputFile, PatientInput } from "../types/InputFile";
import { SolutionFile } from "../types/SolutionFile";

export function checkSurgeonOvertime(inputData: InputFile, solutionData: SolutionFile): string[] {
    const errors: string[] = [];

    // Inicializamos un objeto para acumular la carga diaria de cirugía para cada cirujano.
    // La estructura es: { [surgeonId]: number[] }, donde cada array tiene un elemento por día.
    const surgeonDayLoad: { [surgeonId: string]: number[] } = {};
    inputData.surgeons.forEach(surgeon => {
        surgeonDayLoad[surgeon.id] = new Array(inputData.days).fill(0);
    });

    // Mapeamos los datos de cada paciente de entrada para acceso rápido.
    const patientInputsMap = new Map<string, PatientInput>();
    inputData.patients.forEach(patient => {
        patientInputsMap.set(patient.id, patient);
    });

    // Procesamos los pacientes del archivo de solución.
    // Se asume que la cirugía de cada paciente se realiza en el día de admisión.
    solutionData.patients.forEach(patientSol => {
        // Si el paciente no ha sido admitido, se omite.
        if (patientSol.admission_day === "none") return;

        const admissionDay = patientSol.admission_day as number;
        const patientInput = patientInputsMap.get(patientSol.id);
        if (!patientInput) return;

        const surgeonId = patientInput.surgeon_id;
        // Verificamos que el cirujano esté presente en los datos
        if (!surgeonDayLoad[surgeonId]) return;

        // Sumamos la duración de la cirugía para el cirujano en el día de admisión.
        surgeonDayLoad[surgeonId][admissionDay] += patientInput.surgery_duration;
    });

    // Comparamos la carga acumulada con el máximo permitido para cada cirujano y cada día.
    inputData.surgeons.forEach(surgeon => {
        const maxTimes = surgeon.max_surgery_time; // Vector de tiempos máximos por día
        const loads = surgeonDayLoad[surgeon.id];
        for (let day = 0; day < inputData.days; day++) {
            const load = loads[day];
            // Si no hay valor definido para un día, asumimos 0
            const maxTime = maxTimes[day] || 0;
            if (load > maxTime) {
                const excess = load - maxTime;
                errors.push(`Surgeon ${surgeon.id} has ${excess} minutes of overtime on day ${day}`);
            }
        }
    });

    return errors;
}
