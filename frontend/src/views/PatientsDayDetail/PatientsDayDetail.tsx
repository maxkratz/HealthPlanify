import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../DataContext';

export const PatientsDayDetail: React.FC = () => {
  const { dayId } = useParams();
  // Convertir a número si lo necesitas para manipular los datos
  const dayNumber = Number(dayId);
  const data = useData();
  
  // Ahora puedes obtener los datos correspondientes a este día usando dayNumber
  const dayData = data.inputData?.operating_theaters[0].availability[dayNumber];

  return (
    <div>
      <h1>Detalle del Día {dayNumber}</h1>
      {dayData ? (
        <div>
          <p>{JSON.stringify(dayData)}</p>
        </div>
      ) : (
        <p>No hay datos disponibles para este día.</p>
      )}
    </div>
  );
};
