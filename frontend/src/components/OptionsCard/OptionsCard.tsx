import React from 'react';

import OptionsStyle from './OptionsCard.module.scss';

export type OptionsComponentProps = {
    children: React.ReactNode;
};

export const OptionsCard: React.FC<OptionsComponentProps> = ({
    children,
    ...props
}) => {

    return (
        <div className={OptionsStyle.container}>
            <span {...props}>{children}</span>
        </div>
    );
};