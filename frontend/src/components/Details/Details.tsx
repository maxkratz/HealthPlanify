import React, { ReactNode } from 'react';
import DetailsStyle from './Details.module.scss';

export type DetailsComponentProps = {
    children: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const Details: React.FC<DetailsComponentProps> = ({
    children,
    ...props
}) => {
    return (
        <div className={DetailsStyle.container} {...props}>
            {children}
        </div>
    );
};
