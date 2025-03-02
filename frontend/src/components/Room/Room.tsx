import React from 'react';
import RoomStyle from './Room.module.scss';
import { PatientOutput } from '../../types/SolutionFile';
import { Occupant } from '../../types/InputFile';

export type RoomComponentProps = {
  roomId: string;
  capacity: number;
  patients: PatientOutput[];
  occupants: Occupant[];
};

export const Room: React.FC<RoomComponentProps> = ({
  roomId,
  capacity,
  patients,
  occupants,
  ...props
}) => {
  const totalAssigned = patients.length + occupants.length;

  let modifier = 'free';
  if (totalAssigned >= capacity) {
    modifier = 'full';
  } else if (totalAssigned >= capacity * 0.5) {
    modifier = 'half';
  }

  const containerClassName = `${RoomStyle.container} ${RoomStyle[`container--${modifier}`]}`;

  return (
    <div className={containerClassName}>
      <span {...props}>Room: {roomId}</span>
      <span {...props}>Capacity: {capacity}</span>
      <span {...props}>Assigned: {totalAssigned}</span>
    </div>
  );
};
