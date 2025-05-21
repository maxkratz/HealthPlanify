import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { OptionsCard } from '../../components/OptionsCard/OptionsCard';

export const Options: React.FC = () => {
    const { branch } = useParams();

    return (
        <div>
            {branch === 'Rooms' && (
                <div>
                    <div className='mb-24'>
                        <h1>{branch}</h1>
                    </div>
                    <div className="flex flex-row justify-center gap-4">
                        <OptionsCard>
                            <nav>
                                <Link to="/Rooms/Options/Calendar">Calendar</Link>
                            </nav>
                        </OptionsCard>
                    </div>
                </div>
            )}

            {branch === 'Nurses' && (
                <div>
                    <div className='mb-24'>
                        <h1>{branch}</h1>
                    </div>
                    <div className="flex flex-row justify-center gap-4">
                        <OptionsCard>
                            <nav>
                                <Link to="/Nurses/Options/Calendar">Calendar</Link>
                            </nav>
                        </OptionsCard>
                        <OptionsCard>
                            <nav>
                                <Link to="/Nurses/Options/NursesConstraints">Constraints</Link>
                            </nav>
                        </OptionsCard>
                    </div>
                </div>
            )}

            {branch === 'Surgeons' && (
                <div>
                    <div className='mb-24'>
                        <h1>{branch}</h1>
                    </div>
                    <div className="flex flex-row justify-center gap-4">
                        <OptionsCard>
                            <nav>
                                <Link to="/Surgeons/Options/Calendar">Calendar</Link>
                            </nav>
                        </OptionsCard>
                        <OptionsCard>
                            <nav>
                                <Link to="/Surgeons/Options/SurgeonsConstraints">Constraints</Link>
                            </nav>
                        </OptionsCard>
                    </div>
                </div>
            )}

            {branch === 'OperatingTheaters' && (
                <div>
                    <div className='mb-24'>
                        <h1>{branch}</h1>
                    </div>
                    <div className="flex flex-row justify-center gap-4">
                        <OptionsCard>
                            <nav>
                                <Link to="/OperatingTheaters/Options/Calendar">Calendar</Link>
                            </nav>
                        </OptionsCard>
                        <OptionsCard>
                            <nav>
                                <Link to="/OperatingTheaters/Options/OperatingTheatersConstraints">Constraints</Link>
                            </nav>
                        </OptionsCard>
                    </div>
                </div>
            )}
        </div>
    );
};
