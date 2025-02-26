// import PatientsElectionStyle from './PatientsElection.module.scss';

import React from 'react';
import { Day } from '../../components/Day/Day';
import { useData } from "../../DataContext";

export const Patients: React.FC = () => {
  const data = useData();
  const days = data.inputData?.days || 0;

  return (
    <div className="flex flex-row">
      {Array.from({ length: days }, (_, index) => (
        <Day key={index} dayNumber={index} />
      ))}
    </div>
  );
};
