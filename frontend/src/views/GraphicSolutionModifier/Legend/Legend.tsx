import React from 'react';
import { useData } from '../../../DataContext';

export const Legend: React.FC = () => {
    const { inputData } = useData();

    if (!inputData) {
        return <div>Ups, something went wrong! There is no loaded data</div>;
    }

    const ageGroups: string[] = inputData.age_groups;

    return (
        <div className="flex flex-col gap-6">
            <h3>Legend</h3>

            <div className="flex flex-col gap-2">
                <h4>Age Groups</h4>
                {ageGroups.map((group) => (
                    <div key={group} className="flex items-center gap-2">
                        <span><strong>{group}:  </strong></span>
                        <span>{group.charAt(0)}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-2">
                <h4>Categories</h4>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4" style={{ backgroundColor: 'var(--color-blue)' }}></div>
                    <span>Male</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4" style={{ backgroundColor: 'var(--color-rose)' }}></div>
                    <span>Female</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-dashed"></div>
                    <span>Not mandatory</span>
                </div>
            </div>
        </div>
    );
};
