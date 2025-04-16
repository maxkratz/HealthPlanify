import { InputFile, PatientInput } from "../../types/InputFile";
import { SolutionFile } from "../../types/SolutionFile";

export function checkRoomCapacity(inputData: InputFile, solutionData: SolutionFile): string[] {
    const errors: string[] = [];

    // Creamos un mapa para contar la ocupación diaria de cada sala:
    // { roomId: number[] } donde el array tiene un elemento por cada día del periodo
    const roomOccupancy: { [roomId: string]: number[] } = {};
    inputData.rooms.forEach(room => {
        roomOccupancy[room.id] = new Array(inputData.days).fill(0);
    });

    // Procesamos los ocupantes (pacientes que ya están ingresados)
    // Se asume que un ocupante ocupa la sala desde el día 0 hasta (length_of_stay - 1)
    inputData.occupants.forEach(occupant => {
        for (let day = 0; day < occupant.length_of_stay && day < inputData.days; day++) {
            roomOccupancy[occupant.room_id][day]++;
        }
    });

    // Construimos un mapa para acceder rápidamente a los datos de cada paciente de entrada
    const patientInputsMap = new Map<string, PatientInput>();
    inputData.patients.forEach(patient => {
        patientInputsMap.set(patient.id, patient);
    });

    // Procesamos los pacientes del archivo de solución
    solutionData.patients.forEach(patientSol => {
        // Si el paciente no ha sido admitido, se omite
        if (patientSol.admission_day === "none") return;

        const admissionDay = patientSol.admission_day as number;
        const patientInput = patientInputsMap.get(patientSol.id);
        if (!patientInput) return;

        const lengthOfStay = patientInput.length_of_stay;
        // Se asume que el paciente ocupa la sala desde el día de admisión hasta (admission_day + length_of_stay - 1)
        for (let day = admissionDay; day < admissionDay + lengthOfStay && day < inputData.days; day++) {
            roomOccupancy[patientSol.room][day]++;
        }
    });

    // Verificamos la restricción: el número de pacientes en cada sala en cada día no puede superar la capacidad de la sala.
    inputData.rooms.forEach(room => {
        for (let day = 0; day < inputData.days; day++) {
            const occupancy = roomOccupancy[room.id][day];
            if (occupancy > room.capacity) {
                const overload = occupancy - room.capacity;
                errors.push(`Room ${room.id} is overloaded by ${overload} on day ${day}`);
            }
        }
    });

    return errors;
}
