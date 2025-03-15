import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { First } from '../../components/First/First';

export const SecondElection: React.FC = () => {
    const { branch } = useParams();

    return (
        <div>
            {branch === 'Rooms' && (
                <div>
                    <div className='mb-16'>
                        <h1>{branch}</h1>
                    </div>
                    <div className="flex flex-row justify-center gap-4">
                        <First>
                            <nav>
                                <Link to="/FirstElection/Rooms/SecondElection/Calendar">Calendar</Link>
                            </nav>
                        </First>
                        <First>
                            <nav>
                                <Link to="/FirstElection/Rooms/SecondElection/RoomsConstraints">Constraints</Link>
                            </nav>
                        </First>
                    </div>
                </div>
            )}

            {branch === 'Nurses' && (
                <div>
                    <div className='mb-16'>
                        <h1>{branch}</h1>
                    </div>
                    <div className="flex flex-row justify-center gap-4">
                        <First>
                            <nav>
                                <Link to="/FirstElection/Nurses/SecondElection/Calendar">Calendar</Link>
                            </nav>
                        </First>
                        <First>
                            <nav>
                                <Link to="/FirstElection/Nurses/SecondElection/NursesConstraints">Constraints</Link>
                            </nav>
                        </First>
                    </div>
                </div>
            )}

            {branch === 'Surgeons' && (
                <div>
                    <div className='mb-16'>
                        <h1>{branch}</h1>
                    </div>
                    <div className="flex flex-row justify-center gap-4">
                        <First>
                            <nav>
                                <Link to="/FirstElection/Surgeons/SecondElection/Calendar">Calendar</Link>
                            </nav>
                        </First>
                        <First>
                            <nav>
                                <Link to="/FirstElection/Surgeons/SecondElection/SurgeonsConstraints">Constraints</Link>
                            </nav>
                        </First>
                    </div>
                </div>
            )}

            {branch === 'OperatingTheaters' && (
                <div>
                    <div className='mb-16'>
                        <h1>{branch}</h1>
                    </div>
                    <div className="flex flex-row justify-center gap-4">
                        <First>
                            <nav>
                                <Link to="/FirstElection/OperatingTheaters/SecondElection/Calendar">Calendar</Link>
                            </nav>
                        </First>
                        <First>
                            <nav>
                                <Link to="/FirstElection/OperatingTheaters/SecondElection/OperatingTheatersConstraints">Constraints</Link>
                            </nav>
                        </First>
                    </div>
                </div>
            )}
        </div>
    );
};
