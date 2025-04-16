import { InputFile } from "../../types/InputFile";
import { SolutionFile } from "../../types/SolutionFile";
import { AgeGroup } from "../../types/types";


export function calculateGlobalS1AgeDifference(inputData: InputFile, solutionData: SolutionFile): number {
    // Verifica que ambos datos existan; de lo contrario, retorna 0.
    if (!inputData || !solutionData) {
        return 0;
    }

    const { rooms, age_groups, patients, occupants, days, weights } = inputData;
    let totalAgeDifference = 0;

    // Mapas para acceder rápidamente a la información de edad y duración de estancia de cada paciente.
    const patientAgeMap = new Map(patients.map(p => [p.id, p.age_group]));
    const occupantAgeMap = new Map(occupants.map(o => [o.id, o.age_group]));
    const patientStayMap = new Map(patients.map(p => [p.id, p.length_of_stay || 0]));

    // Itera por cada sala y cada día para determinar la diferencia de grupos de edad presentes.
    rooms.forEach(room => {
        for (let day = 0; day < days; day++) {
            // Obtiene los pacientes asignados a la sala para el día actual según la solución
            const patientsInRoom = solutionData.patients.filter(p => {
                if (typeof p.admission_day !== "number") return false;
                return (
                    p.room === room.id &&
                    p.admission_day <= day &&
                    day < p.admission_day + (patientStayMap.get(p.id) ?? 0)
                );
            });

            // Obtiene los ocupantes que ya están en la sala desde el inicio.
            const occupantsInRoom = occupants.filter(o =>
                o.room_id === room.id && day < o.length_of_stay
            );

            // Obtiene los índices de los grupos de edad según el orden en el arreglo age_groups.
            const ageIndices = [...patientsInRoom, ...occupantsInRoom]
                .map(person => {
                    // Trata de obtener el grupo de edad, ya sea del paciente o del ocupante.
                    const ageGroup = patientAgeMap.get(person.id) || occupantAgeMap.get(person.id);
                    return ageGroup ? age_groups.indexOf(ageGroup as AgeGroup) : -1;
                })
                .filter(index => index !== -1);

            // Si hay al menos un grupo de edad presente, se calcula la diferencia entre el máximo y el mínimo.
            if (ageIndices.length > 0) {
                const minAge = Math.min(...ageIndices);
                const maxAge = Math.max(...ageIndices);
                totalAgeDifference += maxAge - minAge;
            }
        }
    });

    // Se multiplica el coste total por el peso configurado para la restricción S1.
    const globalS1Weighted = weights.room_mixed_age ?? 1;
    return totalAgeDifference * globalS1Weighted;
}
