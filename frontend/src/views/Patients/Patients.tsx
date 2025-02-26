// import PatientsElectionStyle from './PatientsElection.module.scss';

import React from 'react';
import { Link } from 'react-router-dom';
import { Day } from '../../components/Day/Day';
import { useData } from "../../DataContext";

export const Patients: React.FC = () => {
    const data = useData();
    const days = data.inputData?.days || 0;

    return (
        <div className="flex flex-row">
            {Array.from({ length: days }, (_, index) => (
                <Link key={index} to={`/FirstElection/Patients/${index}`}>
                    <Day dayNumber={index} />
                </Link>
            ))}
        </div>
    );
};

