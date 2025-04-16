import React, { useState } from 'react';
import { NurseConstraint } from '../../../components/NurseConstraint';
import { useData } from "../../../DataContext";
import { SortButton } from '../../../components/SortButton';
import { calculateNurseGlobalConstraints } from '../../../utils/SoftConstraints/calculateNurseSoftGlobalConstraints';
import { FlagBanner, Heart, BatteryFull } from 'phosphor-react';

export const NursesConstraints: React.FC = () => {
    const data = useData();
    const [sortCriteria, setSortCriteria] = useState<"S2" | "S3" | "S4" | "total">("total");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const handleSort = (criteria: "S2" | "S3" | "S4" | "total") => {
        if (criteria === sortCriteria) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortCriteria(criteria);
            setSortDirection("desc");
        }
    };


    if (!data.inputData || !data.solutionData) {
        return <div>Ups, something went wrong! There is no loaded data</div>;
    }

    const { weights } = data.inputData;

    const nursesCost = calculateNurseGlobalConstraints(data.inputData, data.solutionData);
    const globalS2Weighted = nursesCost.globalS2Weighted;
    const globalS3Weighted = nursesCost.globalS3Weighted;
    const globalS4Weighted = nursesCost.globalS4Weighted;
    const nursePenalties = nursesCost.nursePenalties;

    const sortedNursePenalties = [...nursePenalties].sort((a, b) => {
        let diff = 0;
        if (sortCriteria === 'S2') {
            diff = a.S2 - b.S2;
        } else if (sortCriteria === 'S3') {
            diff = a.S3 - b.S3;
        } else if (sortCriteria === 'S4') {
            diff = a.S4 - b.S4;
        } else {
            diff = (a.S2 + a.S3 + a.S4) - (b.S2 + b.S3 + b.S4);
        }
        return sortDirection === 'asc' ? diff : -diff;
    });

    const maxTotal = Math.max(...nursePenalties.map(nurse => nurse.S2 + nurse.S3 + nurse.S4));

    return (
        <div>
            <div className='mb-16'>
                <h1>Nurses Contraints</h1>
            </div>

            <div className='mb-16'>
                <h2>Global Costs of Restrictions</h2>
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <FlagBanner size={24} weight="fill" color="var(--color-icon-flagBanner)" />
                    <span>
                        <strong>S2 - Minimum Skill Level</strong>
                    </span> (Weight: {weights.room_nurse_skill}): {globalS2Weighted}
                </div>
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <Heart size={24} weight="fill" color="var(--color-icon-heart)" />
                    <span>
                        <strong>S3 - Continuity of Care</strong>
                    </span> (Weight: {weights.continuity_of_care}): {globalS3Weighted}
                </div>
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <BatteryFull size={24} weight="fill" color="var(--color-icon-batteryFull)" />
                    <span>
                        <strong>S4 - Maximum Workload</strong>
                    </span> (Weight: {weights.nurse_eccessive_workload}): {globalS4Weighted}
                </div>
            </div>

            <div className="mb-16 flex items-center justify-center flex-row gap-4">
                <SortButton
                    onClick={() => handleSort("total")}
                    active={sortCriteria === "total"}
                    label="Sort by Total"
                    sortDirection={sortCriteria === "total" ? sortDirection : undefined}
                />
                <SortButton
                    onClick={() => handleSort("S2")}
                    active={sortCriteria === "S2"}
                    icon={<FlagBanner size={20} weight="fill" color="var(--color-icon-flagBanner)" />}
                    label="Sort by S2"
                    sortDirection={sortCriteria === "S2" ? sortDirection : undefined}
                />
                <SortButton
                    onClick={() => handleSort("S3")}
                    active={sortCriteria === "S3"}
                    icon={<Heart size={20} weight="fill" color="var(--color-icon-heart)" />}
                    label="Sort by S3"
                    sortDirection={sortCriteria === "S3" ? sortDirection : undefined}
                />
                <SortButton
                    onClick={() => handleSort("S4")}
                    active={sortCriteria === "S4"}
                    icon={<BatteryFull size={20} weight="fill" color="var(--color-icon-batteryFull)" />}
                    label="Sort by S4"
                    sortDirection={sortCriteria === "S4" ? sortDirection : undefined}
                />
            </div>


            <div className="flex items-center justify-center flex-row flex-wrap gap-4">
                {sortedNursePenalties.map(({ nurseId, S2, S3, S4 }) => (
                    <NurseConstraint
                        key={nurseId}
                        nurseId={nurseId}
                        s2MinimumSkillLevel={S2}
                        s3CareContinuity={S3}
                        s4MaximumWorkload={S4}
                        maxTotal={maxTotal}
                    />
                ))}
            </div>
        </div>
    );
};

export default NursesConstraints;
