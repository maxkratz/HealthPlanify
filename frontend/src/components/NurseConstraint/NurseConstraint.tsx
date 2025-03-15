import React from 'react';
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
                <span {...props}>Nurse: {nurseId}</span>
                <span {...props}>S2: {S2_Minimum_skill_level}</span>
                <span {...props}>S3: {S3_Continuity_of_care}</span>
                <span {...props}>S4: {S4_Maximum_workload}</span>
            </div>
        </div>
    );
};
