import React from 'react';

import FirstStyle from './First.module.scss';

export type FirstComponentProps = {
    children: React.ReactNode;
};

export const First: React.FC<FirstComponentProps> = ({
    children,
    ...props
}) => {

    return (
        <div className={FirstStyle.container}>
            <span {...props}>{children}</span>
        </div>
    );
};