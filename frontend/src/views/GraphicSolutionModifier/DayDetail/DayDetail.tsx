import React from 'react';
import { useData } from '../../../DataContext';
import dayDetailStyles from './DayDetail.module.scss';

interface DayDetailProps {
    day: number;
}

export const DayDetail: React.FC<DayDetailProps> = ({ day }) => {
    const { inputData, solutionData } = useData();

    if (!inputData || !solutionData) {
        return <div>Ups, something went wrong! There is no loaded data</div>;
    }

    return (
        <div className={`flex flex-col ${dayDetailStyles.container}`}>
            <h3>{day} Patient Details</h3>
        </div>
    );
};
