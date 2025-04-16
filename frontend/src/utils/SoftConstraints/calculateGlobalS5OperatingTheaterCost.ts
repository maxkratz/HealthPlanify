import { InputFile } from "../../types/InputFile";
import { SolutionFile } from "../../types/SolutionFile";


export function calculateGlobalS5OperatingTheaterCost(
    inputData: InputFile,
    solutionData: SolutionFile
): {
    costS5: number;
    otsOpenedPerDay: number[];
} {
    if (!inputData || !solutionData) {
        return {
            costS5: 0,
            otsOpenedPerDay: [],
        };
    }

    const { days, weights } = inputData;
    const { patients } = solutionData;

    const otsOpenedPerDay: number[] = Array(days).fill(0);

    for (let day = 0; day < days; day++) {
        const otsOpened = new Set<string>(); // Usamos un Set para evitar duplicados

        patients.forEach(patient => {
            if (patient.admission_day === day) {
                otsOpened.add(patient.operating_theater);
            }
        });

        otsOpenedPerDay[day] = otsOpened.size;
    }

    const weightS5 = weights.open_operating_theater;
    const totalOpenOTs = otsOpenedPerDay.reduce((sum, count) => sum + count, 0);
    const costS5 = totalOpenOTs * weightS5;

    return {
        costS5,
        otsOpenedPerDay,
    };
}
