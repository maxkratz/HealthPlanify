import React from 'react';

// import FirstElectionStyle from './FirstElection.module.scss';
import { First } from '../../components/First/First';

export const FirstElection: React.FC = () => {

    return (
        <div>
            <First>Patients</First>
            <First>Nurses</First>
            <First>Surgeons</First>
        </div>
    );
};