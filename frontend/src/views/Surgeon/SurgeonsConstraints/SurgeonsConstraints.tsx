import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useData } from "../../../DataContext";

export const SurgeonsConstraints: React.FC = () => {
    const data = useData();
    if (!data.inputData || !data.solutionData) return <div>Loading...</div>;

    const { days, weights, surgeons } = data.inputData;
    const { patients } = data.solutionData;

    const surgeonTransfersPerDay: number[] = Array(days).fill(0);

    for (let day = 0; day < days; day++) {
        let dayCost = 0;
        surgeons.forEach(surgeon => {
            // Filtrar los pacientes asignados a este cirujano en el día actual
            const patientsForSurgeon = patients.filter(p => {
                const patientInput = data.inputData?.patients.find(pi => pi.id === p.id);
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

    const chartData = surgeonTransfersPerDay.map((count, index) => ({
        day: `Day ${index + 1}`,
        surgeonTransfers: count,
    }));

    return (
        <div>
            <div className="mb-16">
                <h2>Global Cost of Restriction</h2>
                <p>
                    <strong>S6 - Number of different OTs a surgeon is assigned to per day</strong> (Weight: {weightS6}): {costS6}
                </p>
            </div>
            <BarChart width={1300} height={600} data={chartData}>
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="surgeonTransfers" fill="#8884d8" />
            </BarChart>
        </div>
    );
};