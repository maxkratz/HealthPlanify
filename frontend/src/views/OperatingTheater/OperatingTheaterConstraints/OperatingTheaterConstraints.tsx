import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useData } from "../../../DataContext";
import { calculateGlobalS5OperatingTheaterCost } from "../../../utils/SoftConstraints/calculateGlobalS5OperatingTheaterCost";

export const OperatingTheaterConstraints: React.FC = () => {
    const data = useData();
    if (!data.inputData || !data.solutionData) return <div>Ups, something went wrong! There is no loaded data</div>;

    const { weights } = data.inputData;

    const { costS5, otsOpenedPerDay } = calculateGlobalS5OperatingTheaterCost(data.inputData, data.solutionData);

    const chartData = otsOpenedPerDay.map((count, index) => ({
        day: `Day ${index + 1}`,
        openOTs: count,
    }));

    return (
        <div>
            <div className='mb-16'>
                <h2>Global Cost of Restriction</h2>
                <p>
                    <strong>S5 - Open Operating Theathers Per Day</strong> (Weight: {weights.open_operating_theater}): {costS5}
                </p>
            </div>
            <BarChart width={1300} height={600} data={chartData}>
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="openOTs" fill="var(--color-red)" />
            </BarChart>
        </div>
    );
};