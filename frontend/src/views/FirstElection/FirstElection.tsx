// import FirstElectionStyle from './FirstElection.module.scss';

import React from 'react';
import { Link } from "react-router-dom";
import { First } from '../../components/First/First';

export const FirstElection: React.FC = () => {

    return (
        <div className="flex flex-row gap-4">
            <First>
                <nav>
                    <Link to="/FirstElection/Rooms/Calendar">Rooms</Link>
                </nav>
            </First>
            
            <First>
                <nav>
                    <Link to="/FirstElection/Nurses/Calendar">Nurses</Link>
                </nav>
            </First>

            <First>
                <nav>
                    <Link to="/FirstElection/Surgeons/Calendar">Surgeons</Link>
                </nav>
            </First>

            <First>
                <nav>
                    <Link to="/FirstElection/OperatingTheaters/Calendar">Operating Theaters</Link>
                </nav>
            </First>
        </div>
    );
};