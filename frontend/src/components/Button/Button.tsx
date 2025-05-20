import React from 'react';
import styles from './Button.module.scss';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    active = false,
    className = '',
    children,
    ...rest
}) => (
    <button
        className={`
      ${styles.button}
      ${active ? styles['button--active'] : ''}
      ${className}
    `.trim()}
        {...rest}
    >
        {children}
    </button>
);