// import FirstElectionStyle from './FirstElection.module.scss';

import React from 'react';
import { Link } from "react-router-dom";
import { Election } from '../../components/Election/Election';

export const FirstElection: React.FC = () => {

    return (
        <div className="flex flex-row justify-center gap-4">
            <Election>
                <nav>
                    <Link to="/FirstElection/Rooms/SecondElection">Rooms</Link>
                </nav>
            </Election>

            <Election>
                <nav>
                    <Link to="/FirstElection/Nurses/SecondElection">Nurses</Link>
                </nav>
            </Election>

            <Election>
                <nav>
                    <Link to="/FirstElection/Surgeons/SecondElection">Surgeons</Link>
                </nav>
            </Election>

            <Election>
                <nav>
                    <Link to="/FirstElection/OperatingTheaters/SecondElection">Operating Theaters</Link>
                </nav>
            </Election>

            <Election>
                <nav>
                    <Link to="/FirstElection/GeneralConstraints">General Constraints</Link>
                </nav>
            </Election>
        </div>
    );
};