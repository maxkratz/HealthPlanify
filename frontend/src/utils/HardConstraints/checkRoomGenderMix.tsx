import { InputFile, PatientInput } from "../../types/InputFile";
import { SolutionFile } from "../../types/SolutionFile";


export function checkRoomGenderMix(inputData: InputFile, solutionData: SolutionFile): string[] {
    // Mapa para contar pacientes por género en cada sala y día.
    // La estructura es: { [roomId]: { [day]: { A: number, B: number } } }
    const roomGenderCount: { [roomId: string]: { [day: number]: { A: number; B: number } } } = {};

    // Inicializamos para cada sala y cada día de la planificación.
    inputData.rooms.forEach(room => {
        roomGenderCount[room.id] = {};
        for (let day = 0; day < inputData.days; day++) {
            roomGenderCount[room.id][day] = { A: 0, B: 0 };
        }
    });

    // Procesamos los ocupantes (pacientes que ya están en el hospital desde el día 0)
    inputData.occupants.forEach(occupant => {
        // Se asume que el ocupante está en la sala asignada desde el día 0 hasta (length_of_stay - 1)
        for (let day = 0; day < occupant.length_of_stay && day < inputData.days; day++) {
            roomGenderCount[occupant.room_id][day][occupant.gender]++;
        }
    });

    // Creamos un mapa para acceder a los datos de entrada de cada paciente usando su id.
    const patientInputsMap = new Map<string, PatientInput>();
    inputData.patients.forEach(p => {
        patientInputsMap.set(p.id, p);
    });

    // Procesamos los pacientes del archivo de solución.
    solutionData.patients.forEach(patientSol => {
        // Si el paciente no ha sido admitido, se omite.
        if (patientSol.admission_day === "none") return;
        const admissionDay = patientSol.admission_day as number;
        const roomId = patientSol.room;
        const patientInput = patientInputsMap.get(patientSol.id);
        if (!patientInput) {
            // Si no se encuentra el paciente en los datos de entrada, se podría registrar un error o ignorar.
            return;
        }
        const lengthOfStay = patientInput.length_of_stay;
        // Se asume que el paciente permanece en la sala desde el día de admisión hasta (admission_day + length_of_stay - 1)
        for (let day = admissionDay; day < admissionDay + lengthOfStay && day < inputData.days; day++) {
            if (patientInput.gender === "A" || patientInput.gender === "B") {
                roomGenderCount[roomId][day][patientInput.gender]++;
            }
        }
    });

    // Verificamos la restricción H1: no se permite mezclar géneros en la misma sala.
    const errors: string[] = [];
    inputData.rooms.forEach(room => {
        for (let day = 0; day < inputData.days; day++) {
            const countA = roomGenderCount[room.id][day].A;
            const countB = roomGenderCount[room.id][day].B;
            if (countA > 0 && countB > 0) {
                errors.push(`Room ${room.id} is gender-mixed ${countA} male(s) / ${countB} female(s) on day ${day}`);
            }
        }
    });

    return errors;
}
