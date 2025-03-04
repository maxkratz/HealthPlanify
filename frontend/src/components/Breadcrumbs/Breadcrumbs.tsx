import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import BreadcrumbsStyle from './Breadcrumbs.module.scss';

export const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const { pathname } = location;
    // Divide rute by "/" and remove empty strings
    const pathnames = pathname.split('/').filter(x => x);

    return (
        <nav className={`flex justify-center mb-10 ${BreadcrumbsStyle.container}`}>
            <ul className="flex flex-row items-center gap-2">
                <li>
                    <Link to="/">Home</Link>
                </li>
                {pathnames.map((value, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    return (
                        <li key={to}>
                            <Link to={to}>{value}</Link>
                        </li>
                    );
                })}
            </ul>
        </nav>

    );
};