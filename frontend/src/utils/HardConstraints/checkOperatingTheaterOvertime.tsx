import { InputFile, PatientInput } from "../../types/InputFile";
import { SolutionFile } from "../../types/SolutionFile";


export function checkOperatingTheaterOvertime(
    inputData: InputFile,
    solutionData: SolutionFile
): string[] {
    const errors: string[] = [];

    // Inicializamos el contador de tiempo de cirugía por OT y día
    const otDaySurgeryTime: { [otId: string]: number[] } = {};
    inputData.operating_theaters.forEach(ot => {
        otDaySurgeryTime[ot.id] = new Array(inputData.days).fill(0);
    });

    // Map para acceder rápido a los PatientInput
    const patientInputMap = new Map<string, PatientInput>();
    inputData.patients.forEach(patient => {
        patientInputMap.set(patient.id, patient);
    });

    // Recorremos cada paciente de la solución
    solutionData.patients.forEach(patientSol => {
        // Si no está programado, saltamos
        if (patientSol.admission_day === "none") return;

        const admissionDay = patientSol.admission_day as number;
        const otId = patientSol.operating_theater;

        // ⇒ Nuevo: comprobar que tenga quirófano asignado
        if (!otId) {
            errors.push(
                `Patient ${patientSol.id} has no operating theater assigned on day ${admissionDay}`
            );
            return;
        }

        // Obtener datos de entrada del paciente
        const patientInput = patientInputMap.get(patientSol.id);
        if (!patientInput) return;

        // Sumar la duración de la cirugía
        otDaySurgeryTime[otId][admissionDay] += patientInput.surgery_duration;
    });

    // Verificamos si alguna OT supera su disponibilidad diaria
    inputData.operating_theaters.forEach(ot => {
        const availability = ot.availability;
        const dailySurgeryTime = otDaySurgeryTime[ot.id];

        for (let day = 0; day < inputData.days; day++) {
            const totalSurgeryTime = dailySurgeryTime[day];
            const capacity = availability[day] || 0;

            if (totalSurgeryTime > capacity) {
                const overtime = totalSurgeryTime - capacity;
                errors.push(
                    `Operating theater ${ot.id} has ${overtime} minutes of overtime on day ${day}`
                );
            }
        }
    });

    return errors;
}
