import React from 'react';

import ElectionStyle from './Election.module.scss';

export type ElectionComponentProps = {
    children: React.ReactNode;
};

export const Election: React.FC<ElectionComponentProps> = ({
    children,
    ...props
}) => {

    return (
        <div className={ElectionStyle.container}>
            <span {...props}>{children}</span>
        </div>
    );
};