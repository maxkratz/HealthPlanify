import { InputFile } from "../../types/InputFile";
import { SolutionFile } from "../../types/SolutionFile";


export function calculateGlobalS6SurgeonTransferCost(
    inputData: InputFile,
    solutionData: SolutionFile
): {
    costS6: number;
    surgeonTransfersPerDay: number[];
} {
    // Verifica que ambos datos existan; de lo contrario, retorna 0.
    if (!inputData || !solutionData) {
        return {
            costS6: 0,
            surgeonTransfersPerDay: [],
        };
    }
    const { days, weights, surgeons } = inputData;
    const { patients } = solutionData;

    const surgeonTransfersPerDay: number[] = Array(days).fill(0);

    for (let day = 0; day < days; day++) {
        let dayCost = 0;
        surgeons.forEach(surgeon => {
            // Filtrar los pacientes asignados a este cirujano en el día actual
            const patientsForSurgeon = patients.filter(p => {
                const patientInput = inputData?.patients.find(pi => pi.id === p.id);
                return patientInput && patientInput.surgeon_id === surgeon.id && p.admission_day === day;
            });

            // Se cuentan los quirófanos distintos utilizados en ese día
            const distinctOTs = new Set<string>();
            patientsForSurgeon.forEach(p => distinctOTs.add(p.operating_theater));

            // Si el cirujano tiene pacientes asignados, el costo es (número de OTs distintos - 1)
            if (patientsForSurgeon.length > 0 && distinctOTs.size > 0) {
                dayCost += (distinctOTs.size - 1);
            }
        });
        surgeonTransfersPerDay[day] = dayCost;
    }

    const totalTransfers = surgeonTransfersPerDay.reduce((sum, val) => sum + val, 0);
    const weightS6 = weights.surgeon_transfer;
    const costS6 = totalTransfers * weightS6;

    return {
        costS6,
        surgeonTransfersPerDay,
    };
}
