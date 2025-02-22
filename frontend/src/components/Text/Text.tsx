import React from 'react'

import classNames from "classnames";
import textStyle from './text.module.scss'
import { TextVariant, TextWeight } from "./utils/constants";


export type TextComponentProps = {
    weight?: TextWeight;
    variant?: TextVariant;
    align?: 'left' | 'center' | 'right';
    className?: string;
    children: React.ReactNode;
    [key: string]: any;
};

const TextComponent: React.FC<TextComponentProps> = ({
    weight=TextWeight.NORMAL,
    variant=TextVariant.BODY_2,
    align,
    className,
    children,
    ...props
}) => {

    const weightClass = textStyle[`text--${weight}`];
    const variantClass = textStyle[`text--${variant}`];
    const alignClass = textStyle[`text--${align}`];
    const combinedClasses = classNames(textStyle.text, variantClass, weightClass, alignClass, className);

    return (
        <span className={combinedClasses} {...props}>{children}</span>
    );
};

export const Text = ({ children, ...props } : TextComponentProps) => {
    return (
        <TextComponent {...props}> {children} </TextComponent>
    );
};