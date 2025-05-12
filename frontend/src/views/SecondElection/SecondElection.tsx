import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Election } from '../../components/Election/Election';

export const SecondElection: React.FC = () => {
    const { branch } = useParams();

    return (
        <div>
            {branch === 'Rooms' && (
                <div>
                    <div className='mb-24'>
                        <h1>{branch}</h1>
                    </div>
                    <div className="flex flex-row justify-center gap-4">
                        <Election>
                            <nav>
                                <Link to="/Rooms/SecondElection/Calendar">Calendar</Link>
                            </nav>
                        </Election>
                    </div>
                </div>
            )}

            {branch === 'Nurses' && (
                <div>
                    <div className='mb-24'>
                        <h1>{branch}</h1>
                    </div>
                    <div className="flex flex-row justify-center gap-4">
                        <Election>
                            <nav>
                                <Link to="/Nurses/SecondElection/Calendar">Calendar</Link>
                            </nav>
                        </Election>
                        <Election>
                            <nav>
                                <Link to="/Nurses/SecondElection/NursesConstraints">Constraints</Link>
                            </nav>
                        </Election>
                    </div>
                </div>
            )}

            {branch === 'Surgeons' && (
                <div>
                    <div className='mb-24'>
                        <h1>{branch}</h1>
                    </div>
                    <div className="flex flex-row justify-center gap-4">
                        <Election>
                            <nav>
                                <Link to="/Surgeons/SecondElection/Calendar">Calendar</Link>
                            </nav>
                        </Election>
                        <Election>
                            <nav>
                                <Link to="/Surgeons/SecondElection/SurgeonsConstraints">Constraints</Link>
                            </nav>
                        </Election>
                    </div>
                </div>
            )}

            {branch === 'OperatingTheaters' && (
                <div>
                    <div className='mb-24'>
                        <h1>{branch}</h1>
                    </div>
                    <div className="flex flex-row justify-center gap-4">
                        <Election>
                            <nav>
                                <Link to="/OperatingTheaters/SecondElection/Calendar">Calendar</Link>
                            </nav>
                        </Election>
                        <Election>
                            <nav>
                                <Link to="/OperatingTheaters/SecondElection/OperatingTheatersConstraints">Constraints</Link>
                            </nav>
                        </Election>
                    </div>
                </div>
            )}
        </div>
    );
};
