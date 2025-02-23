import React from 'react';
import { useData } from "../../DataContext";

export const Prueba: React.FC = () => {
  const data = useData();

  const outputdata = data.solutionData?.patients
  data.inputData?.patients.map((patient_input) => {
    outputdata?.map((patient_sol) => {
      if (patient_input.id === patient_sol.id) {
        console.log(patient_sol.id, patient_input.surgeon_id);
      }
    });
  })

  return (
    <div>
      <h1>Data from Context:</h1>
      <pre>{JSON.stringify(outputdata, null, 2)}</pre>
    </div>
  );
};