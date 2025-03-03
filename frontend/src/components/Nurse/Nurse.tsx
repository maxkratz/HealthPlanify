import React from 'react';
import NurseStyle from './Nurse.module.scss';

export type NurseComponentProps = {
  nurseId: string;
  skillLevel: number;
  maxLoad: number;
};

export const Nurse: React.FC<NurseComponentProps> = ({
  nurseId,
  skillLevel,
  maxLoad,
  ...props
}) => {
  return (
    <div className={NurseStyle.container}>
      <span {...props}>Nurse: {nurseId}</span>
      <span {...props}>Skill Level: {skillLevel}</span>
      <span {...props}>Max Load: {maxLoad}</span>
    </div>
  );
};
