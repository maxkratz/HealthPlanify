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
  // Sumar el número de pacientes y occupants asignados
  const totalAssigned = patients.length + occupants.length;

  // Definir el modificador según thresholds:
  // - Verde si está por debajo del 50% de la capacidad.
  // - Amarillo si está entre el 50% y la capacidad.
  // - Rojo si es igual o mayor a la capacidad.
  let modifier = 'green';
  if (totalAssigned >= capacity) {
    modifier = 'red';
  } else if (totalAssigned >= capacity * 0.5) {
    modifier = 'yellow';
  }

  // Combina la clase base con la modificadora
  const containerClassName = `${RoomStyle.container} ${RoomStyle[`container--${modifier}`]}`;

  return (
    <div className={containerClassName}>
      <span {...props}>Sala: {roomId}</span>
      <span {...props}>Capacidad: {capacity}</span>
      <span {...props}>Asignados: {totalAssigned}</span>
    </div>
  );
};
