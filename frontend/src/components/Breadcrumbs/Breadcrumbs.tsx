import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import BreadcrumbsStyle from './Breadcrumbs.module.scss';

export const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const { pathname } = location;
    const pathnames = pathname.split('/').filter(x => x);

    const allowedSegments = ["FirstElection", "Calendar", "RoomsList", "Shifts", "NursesInfo"];

    return (
        <nav className={`flex justify-center mb-16 ${BreadcrumbsStyle.container}`}>
            <ul className="flex flex-row items-center gap-2">
                <li>
                    <Link to="/">Home</Link>
                </li>
                {pathnames.map((segment, index) => {
                    if (!allowedSegments.includes(segment)) return null;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    return (
                        <li key={to}>
                            <Link to={to}>{segment}</Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};
