import React from 'react';
import { FlagBanner, Heart, BatteryFull } from 'phosphor-react';
import NurseConstraintStyle from './NurseConstraint.module.scss';

export type NurseConstraintComponentProps = {
    nurseId: string;
    S2_Minimum_skill_level: number;
    S3_Continuity_of_care: number;
    S4_Maximum_workload: number;
};

export const NurseConstraint: React.FC<NurseConstraintComponentProps> = ({
    nurseId,
    S2_Minimum_skill_level,
    S3_Continuity_of_care,
    S4_Maximum_workload,
    ...props
}) => {

    return (
        <div>
            <div className={NurseConstraintStyle.container}>
                <span {...props}><strong>Nurse: </strong>{nurseId}</span>

                {S2_Minimum_skill_level !== 0 && (
                    <div className={`flex items-center justify-center flex-row gap-2`}>
                        <FlagBanner size={24} weight="fill" color="var(--color-white)" />
                        <span {...props}>S2: {S2_Minimum_skill_level}</span>
                    </div>
                )}

                {S3_Continuity_of_care !== 0 && (
                    <div className={`flex items-center justify-center flex-row gap-2`}>
                        <Heart size={24} weight="fill" color="var(--color-white)" />
                        <span {...props}>S3: {S3_Continuity_of_care}</span>
                    </div>
                )}

                {S4_Maximum_workload !== 0 && (
                    <div className={`flex items-center justify-center flex-row gap-2`}>
                        <BatteryFull size={24} weight="fill" color="var(--color-white)" />
                        <span {...props}>S4: {S4_Maximum_workload}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
