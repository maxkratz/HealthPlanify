import { InputFile } from "../../types/InputFile";
import { SolutionFile } from "../../types/SolutionFile";


export function calculateGlobalS5OperatingTheaterCost(inputData: InputFile, solutionData: SolutionFile): number {
    // Verifica que ambos datos existan; de lo contrario, retorna 0.
    if (!inputData || !solutionData) {
        return 0;
    }

    const { days, weights } = inputData;
    const { patients } = solutionData;

    let totalOpenOTs = 0;

    // Recorre cada día para determinar los quirófanos abiertos.
    for (let day = 0; day < days; day++) {
        // Usamos un Set para evitar contar quirófanos duplicados en un mismo día.
        const otsOpened = new Set<string>();

        // Para cada paciente, si la admisión se realiza en el día actual,
        // se añade el quirófano al Set.
        patients.forEach(patient => {
            if (patient.admission_day === day) {
                otsOpened.add(patient.operating_theater);
            }
        });

        // Se acumula el número de quirófanos abiertos en el día.
        totalOpenOTs += otsOpened.size;
    }

    // Se multiplica el total por el peso de la restricción S5.
    const weightS5 = weights.open_operating_theater ?? 1;
    return totalOpenOTs * weightS5;
}
