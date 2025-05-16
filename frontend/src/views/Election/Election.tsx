import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ElectionCard } from '../../components/ElectionCard/ElectionCard';

export const Election: React.FC = () => {
    const { branch } = useParams();

    return (
        <div>
            {branch === 'Rooms' && (
                <div>
                    <div className='mb-24'>
                        <h1>{branch}</h1>
                    </div>
                    <div className="flex flex-row justify-center gap-4">
                        <ElectionCard>
                            <nav>
                                <Link to="/Rooms/Election/Calendar">Calendar</Link>
                            </nav>
                        </ElectionCard>
                    </div>
                </div>
            )}

            {branch === 'Nurses' && (
                <div>
                    <div className='mb-24'>
                        <h1>{branch}</h1>
                    </div>
                    <div className="flex flex-row justify-center gap-4">
                        <ElectionCard>
                            <nav>
                                <Link to="/Nurses/Election/Calendar">Calendar</Link>
                            </nav>
                        </ElectionCard>
                        <ElectionCard>
                            <nav>
                                <Link to="/Nurses/Election/NursesConstraints">Constraints</Link>
                            </nav>
                        </ElectionCard>
                    </div>
                </div>
            )}

            {branch === 'Surgeons' && (
                <div>
                    <div className='mb-24'>
                        <h1>{branch}</h1>
                    </div>
                    <div className="flex flex-row justify-center gap-4">
                        <ElectionCard>
                            <nav>
                                <Link to="/Surgeons/Election/Calendar">Calendar</Link>
                            </nav>
                        </ElectionCard>
                        <ElectionCard>
                            <nav>
                                <Link to="/Surgeons/Election/SurgeonsConstraints">Constraints</Link>
                            </nav>
                        </ElectionCard>
                    </div>
                </div>
            )}

            {branch === 'OperatingTheaters' && (
                <div>
                    <div className='mb-24'>
                        <h1>{branch}</h1>
                    </div>
                    <div className="flex flex-row justify-center gap-4">
                        <ElectionCard>
                            <nav>
                                <Link to="/OperatingTheaters/Election/Calendar">Calendar</Link>
                            </nav>
                        </ElectionCard>
                        <ElectionCard>
                            <nav>
                                <Link to="/OperatingTheaters/Election/OperatingTheatersConstraints">Constraints</Link>
                            </nav>
                        </ElectionCard>
                    </div>
                </div>
            )}
        </div>
    );
};
