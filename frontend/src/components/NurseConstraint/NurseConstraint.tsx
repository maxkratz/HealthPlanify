import React from 'react';
import { FlagBanner, Heart, BatteryFull } from 'phosphor-react';
import NurseConstraintStyle from './NurseConstraint.module.scss';

export type NurseConstraintComponentProps = {
    nurseId: string;
    s2MinimumSkillLevel: number;
    s3CareContinuity: number;
    s4MaximumWorkload: number;
};

export const NurseConstraint: React.FC<NurseConstraintComponentProps> = ({
    nurseId,
    s2MinimumSkillLevel,
    s3CareContinuity,
    s4MaximumWorkload,
    ...props
}) => {

    return (
        <div className={NurseConstraintStyle.container}>
            <span {...props}><strong>Nurse: </strong>{nurseId}</span>

            {s2MinimumSkillLevel !== 0 && (
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <FlagBanner size={24} weight="fill" color="var(--color-white)" />
                    <span {...props}><strong>S2: </strong>{s2MinimumSkillLevel}</span>
                </div>
            )}

            {s3CareContinuity !== 0 && (
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <Heart size={24} weight="fill" color="var(--color-white)" />
                    <span {...props}><strong>S3: </strong>{s3CareContinuity}</span>
                </div>
            )}

            {s4MaximumWorkload !== 0 && (
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <BatteryFull size={24} weight="fill" color="var(--color-white)" />
                    <span {...props}><strong>S4: </strong>{s4MaximumWorkload}</span>
                </div>
            )}
        </div>
    );
};
