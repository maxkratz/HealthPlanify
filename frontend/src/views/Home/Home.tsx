import React from 'react'

// import classNames from "classnames";
import homeStyle from './home.module.scss'

export type HomeComponentProps = {
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
};

export const Home: React.FC<HomeComponentProps> = ({
    children,
    ...props
}) => {

    return (
        <div className={homeStyle.Home} {...props}>
            {children}
        </div>
    );
};