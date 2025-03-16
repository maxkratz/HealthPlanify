import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useData } from "../../../DataContext";

export const OperatingTheaterConstraints: React.FC = () => {
    const data = useData();
    if (!data.inputData || !data.solutionData) return <div>Loading...</div>;

    const { days, weights } = data.inputData;
    const { patients } = data.solutionData;

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

    const chartData = otsOpenedPerDay.map((count, index) => ({
        day: `Day ${index + 1}`,
        openOTs: count,
    }));

    return (
        <div>
            <div className='mb-16'>
                <h2>Global Cost of Restriction</h2>
                <p>
                    <strong>S5 - Open Operating Theathers Per Day</strong> (Weight: {weightS5}): {costS5}
                </p>
            </div>
            <ResponsiveContainer width={1300} height={600}>
                <BarChart data={chartData}>
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="openOTs" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};