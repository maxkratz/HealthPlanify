import React from 'react';

// import PatientsDayDetailStyle from './PatientsDayDetail.module.scss';

export type PatientsDayDetailComponentProps = {
    dayNumber?: number;
};

export const PatientsDayDetail: React.FC<PatientsDayDetailComponentProps> = ({
    dayNumber,
    ...props
}) => {

    return (
        <div>
            <span {...props}>MIAUUU</span>
        </div>
    );
};