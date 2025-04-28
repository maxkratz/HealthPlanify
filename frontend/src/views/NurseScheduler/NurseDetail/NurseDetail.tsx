import React from 'react';
import { useData } from '../../../DataContext';
import { Nurse } from '../../../types/InputFile';

interface NurseDetailProps {
    nurseId: string;
}

export const NurseDetail: React.FC<NurseDetailProps> = ({ nurseId }) => {
    const { inputData, solutionData } = useData();

    if (!inputData || !solutionData) {
        return <div>Ups, something went wrong! There is no loaded data</div>;
    }

    const nurseInput: Nurse = inputData.nurses.find((ni) => ni.id === nurseId)!;

    return (
        <div className='flex flex-col gap-2'>
            <h3 className='text-center'>{nurseId} Details</h3>
            <p className='text-left'>
                <strong>Skill level:</strong> {nurseInput.skill_level}
            </p>
        </div>
    );
};
