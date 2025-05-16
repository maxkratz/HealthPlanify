import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import BreadcrumbsStyle from './Breadcrumbs.module.scss';

export const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const { pathname } = location;
    const pathnames = pathname.split('/').filter(x => x);

    if (pathnames.length === 0) {
        return null;
    }

    const allowedSegments = [
        "Election",
        "Calendar",
        "RoomsList",
        "Shifts",
        "NursesList",
        "SurgeonsList",
        "OperatingTheatersList",
    ];

    const needsMargin = pathname === '/PatientScheduler' || pathname === '/NurseScheduler';

    return (
        <nav
            className={`
            flex justify-center mb-16
            ${BreadcrumbsStyle.container}
            ${needsMargin ? 'ml-40' : ''}
          `}
        >
            <ul className="flex flex-row items-center">
                <li className="link">
                    <Link to="/">Home</Link>
                </li>
                {pathnames.map((segment, index) => {
                    if (!allowedSegments.includes(segment)) return null;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    return (
                        <React.Fragment key={to}>
                            <li className={BreadcrumbsStyle.separator}>{' > '}</li>
                            <li className="link">
                                <Link to={to}>{segment}</Link>
                            </li>
                        </React.Fragment>
                    );
                })}
            </ul>
        </nav>
    );
};
