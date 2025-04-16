import { InputFile } from "../../types/InputFile";
import { SolutionFile } from "../../types/SolutionFile";


export function calculateGlobalS6SurgeonTransferCost(inputData: InputFile, solutionData: SolutionFile): number {
    // Verifica que ambos datos existan; de lo contrario, retorna 0.
    if (!inputData || !solutionData) {
        return 0;
    }

    const { days, weights, surgeons, patients: inputPatients } = inputData;
    const { patients: solutionPatients } = solutionData;

    // Mapa para acceder rápidamente a la información de cada paciente del input, permitiendo obtener el surgeon_id.
    const patientInputMap = new Map(inputPatients.map(p => [p.id, p]));

    let totalTransfers = 0;

    // Recorre cada día para calcular las transferencias de quirófano por cirujano.
    for (let day = 0; day < days; day++) {
        let dayCost = 0;

        surgeons.forEach(surgeon => {
            // Filtrar los pacientes (de la solución) asignados al cirujano en el día actual.
            const patientsForSurgeon = solutionPatients.filter(p => {
                const inputPatient = patientInputMap.get(p.id);
                return (
                    inputPatient &&
                    inputPatient.surgeon_id === surgeon.id &&
                    p.admission_day === day
                );
            });

            // Se cuentan los quirófanos distintos utilizados por el cirujano en el día.
            const distinctOTs = new Set<string>();
            patientsForSurgeon.forEach(p => distinctOTs.add(p.operating_theater));

            // Si el cirujano tiene pacientes asignados en el día, se suma (número de OTs distintos - 1).
            if (patientsForSurgeon.length > 0 && distinctOTs.size > 0) {
                dayCost += (distinctOTs.size - 1);
            }
        });

        totalTransfers += dayCost;
    }

    // Se obtiene el peso de la restricción S6, usando 1 como valor por defecto si no se define.
    const weightS6 = weights.surgeon_transfer ?? 1;

    return totalTransfers * weightS6;
}
