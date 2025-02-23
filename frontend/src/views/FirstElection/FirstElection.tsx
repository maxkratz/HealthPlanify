// import FirstElectionStyle from './FirstElection.module.scss';

import React from 'react';
import { Link } from "react-router-dom";
import { First } from '../../components/First/First';

export const FirstElection: React.FC = () => {

    return (
        <div>
            <First>
                <nav>
                    <Link to="/FirstElection/Patients">Patients</Link>
                </nav>
            </First>
            <First>Nurses</First>
            <First>Surgeons</First>
        </div>
    );
};