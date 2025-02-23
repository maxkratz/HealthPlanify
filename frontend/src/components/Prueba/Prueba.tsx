import React from 'react';
import { useData } from "../../DataContext";

export const Prueba: React.FC = () => {
  const data = useData();

  return (
    <div>
      <h1>Data from Context:</h1>
      /* <pre>{JSON.stringify(data, null, 2)}</pre> */
    </div>
  );
};