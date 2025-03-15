// import FirstElectionStyle from './FirstElection.module.scss';

import React from 'react';
import { Link } from "react-router-dom";
import { First } from '../../components/First/First';

export const FirstElection: React.FC = () => {

    return (
        <div className="flex flex-row justify-center gap-4">
            <First>
                <nav>
                    <Link to="/FirstElection/Rooms/SecondElection">Rooms</Link>
                </nav>
            </First>

            <First>
                <nav>
                    <Link to="/FirstElection/Nurses/SecondElection">Nurses</Link>
                </nav>
            </First>

            <First>
                <nav>
                    <Link to="/FirstElection/Surgeons/SecondElection">Surgeons</Link>
                </nav>
            </First>

            <First>
                <nav>
                    <Link to="/FirstElection/OperatingTheaters/SecondElection">Operating Theaters</Link>
                </nav>
            </First>

            <First>
                <nav>
                    <Link to="/FirstElection/GeneralConstraints">General Constraints</Link>
                </nav>
            </First>
        </div>
    );
};