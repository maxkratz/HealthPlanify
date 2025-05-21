import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useData } from "../../../DataContext";
import { calculateGlobalS6SurgeonTransferCost } from "../../../utils/SoftConstraints/calculateGlobalS6SurgeonTransferCost";

export const SurgeonsConstraints: React.FC = () => {
    const data = useData();
    if (!data.inputData || !data.solutionData) return <div>Ups, something went wrong! There is no loaded data</div>;

    const { weights } = data.inputData;

    const { costS6, surgeonTransfersPerDay } = calculateGlobalS6SurgeonTransferCost(
        data.inputData,
        data.solutionData
    );

    if (costS6 === 0) {
        return (
            <>
                <div className="mb-16">
                    <h2>Global Cost of Restriction</h2>
                    <p>
                        <strong>S6 - Number of different OTs a surgeon is assigned to per day</strong> (Weight: {weights.surgeon_transfer}): {costS6}
                    </p>
                </div>
                <p className="text-lg font-medium text-[var(--color-grey)]">There is nothing to graph! All surgeons are assigned to the same operating theater every day!</p>
            </>
        );
    }

    const chartData = surgeonTransfersPerDay.map((count, index) => ({
        day: `Day ${index + 1}`,
        surgeonTransfers: count,
    }));

    return (
        <div>
            <div className="mb-16">
                <h2>Global Cost of Restriction</h2>
                <p>
                    <strong>S6 - Number of different OTs a surgeon is assigned to per day</strong> (Weight: {weights.surgeon_transfer}): {costS6}
                </p>
            </div>
            <BarChart width={1300} height={600} data={chartData}>
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="surgeonTransfers" fill="var(--color-blue)" />
            </BarChart>
        </div>
    );
};