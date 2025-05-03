import React from 'react';
import { FlagBanner, Heart, BatteryFull } from 'phosphor-react';
import NurseConstraintStyle from './NurseConstraint.module.scss';

export type NurseConstraintComponentProps = {
    nurseId: string;
    s2MinimumSkillLevel: number;
    s3CareContinuity: number;
    s4MaximumWorkload: number;
    maxTotal: number;
};

export const NurseConstraint: React.FC<NurseConstraintComponentProps> = ({
    nurseId,
    s2MinimumSkillLevel,
    s3CareContinuity,
    s4MaximumWorkload,
    maxTotal,
    ...props
}) => {

    const total = s2MinimumSkillLevel + s3CareContinuity + s4MaximumWorkload;

    let modifier = 'free';
    const fullThreshold = Math.floor(maxTotal * 0.75);
    const halfThreshold = Math.floor(maxTotal * 0.5);
    const semiFreeThreshold = Math.floor(maxTotal * 0.25);

    if (maxTotal >= total && total >= fullThreshold) {
        modifier = 'full';
    } else if (total >= halfThreshold && total < fullThreshold) {
        modifier = 'half';
    } else if (total >= semiFreeThreshold && total < halfThreshold) {
        modifier = 'semifree';
    }

    const containerClassName = `${NurseConstraintStyle.container} ${NurseConstraintStyle[`container--${modifier}`]}`;

    return (
        <div className={containerClassName}>
            <span {...props}><strong>Nurse: </strong>{nurseId}</span>

            {s2MinimumSkillLevel !== 0 && (
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <FlagBanner size={22} weight="fill" color="var(--color-white)" />
                    <span {...props}>{s2MinimumSkillLevel}</span>
                </div>
            )}

            {s3CareContinuity !== 0 && (
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <Heart size={22} weight="fill" color="var(--color-white)" />
                    <span {...props}>{s3CareContinuity}</span>
                </div>
            )}

            {s4MaximumWorkload !== 0 && (
                <div className={`flex items-center justify-center flex-row gap-2`}>
                    <BatteryFull size={22} weight="fill" color="var(--color-white)" />
                    <span {...props}>{s4MaximumWorkload}</span>
                </div>
            )}
        </div>
    );
};
