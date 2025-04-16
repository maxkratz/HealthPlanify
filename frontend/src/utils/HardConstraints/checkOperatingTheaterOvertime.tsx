import { InputFile, PatientInput } from "../../types/InputFile";
import { SolutionFile } from "../../types/SolutionFile";

export function checkOperatingTheaterOvertime(inputData: InputFile, solutionData: SolutionFile): string[] {
    const errors: string[] = [];

    // Inicializamos un objeto para acumular la duración total de cirugía por OT y día.
    // La estructura es: { [otId: string]: number[] } donde cada array tiene 'inputData.days' elementos.
    const otDaySurgeryTime: { [otId: string]: number[] } = {};
    inputData.operating_theaters.forEach(ot => {
        otDaySurgeryTime[ot.id] = new Array(inputData.days).fill(0);
    });

    // Creamos un mapa para acceder rápidamente a los datos de entrada de cada paciente.
    const patientInputMap = new Map<string, PatientInput>();
    inputData.patients.forEach(patient => {
        patientInputMap.set(patient.id, patient);
    });

    // Procesamos cada paciente del archivo de solución.
    // Se asume que la cirugía se realiza en el día de admisión.
    solutionData.patients.forEach(patientSol => {
        if (patientSol.admission_day === "none") return;

        const admissionDay = patientSol.admission_day as number;
        const otId = patientSol.operating_theater;
        const patientInput = patientInputMap.get(patientSol.id);
        if (!patientInput) return;

        // Suma la duración de la cirugía para el OT en el día de admisión.
        otDaySurgeryTime[otId][admissionDay] += patientInput.surgery_duration;
    });

    // Verificamos, para cada OT y cada día, si la duración total de cirugías excede la disponibilidad.
    inputData.operating_theaters.forEach(ot => {
        const availability = ot.availability; // Vector de capacidad diaria del OT
        const dailySurgeryTime = otDaySurgeryTime[ot.id];
        for (let day = 0; day < inputData.days; day++) {
            const totalSurgeryTime = dailySurgeryTime[day];
            const capacity = availability[day] || 0;
            if (totalSurgeryTime > capacity) {
                const overtime = totalSurgeryTime - capacity;
                errors.push(`Operating theater ${ot.id} has ${overtime} minutes of overtime on day ${day}`);
            }
        }
    });

    return errors;
}
