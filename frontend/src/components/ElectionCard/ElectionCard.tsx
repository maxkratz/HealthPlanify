import React from 'react';

import ElectionStyle from './ElectionCard.module.scss';

export type ElectionComponentProps = {
    children: React.ReactNode;
};

export const ElectionCard: React.FC<ElectionComponentProps> = ({
    children,
    ...props
}) => {

    return (
        <div className={ElectionStyle.container}>
            <span {...props}>{children}</span>
        </div>
    );
};