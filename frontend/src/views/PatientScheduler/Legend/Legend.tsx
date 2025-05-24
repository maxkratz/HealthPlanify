import React, { useState } from 'react';
import { useData } from '../../../DataContext';

export const Legend: React.FC = () => {
    const { inputData } = useData();
    const [isOpen, setIsOpen] = useState<boolean>(true);

    if (!inputData) {
        return <div>Ups, something went wrong! There is no loaded data</div>;
    }

    const ageGroups: string[] = inputData.age_groups;

    const toggleLegend = () => setIsOpen(prev => !prev);

    return (
        <div className="border rounded p-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Legend</h3>
                <button
                    onClick={toggleLegend}
                    className="
                        px-2 py-1
                        text-sm
                        rounded
                        cursor-pointer

                        transition-all duration-200 ease-in-out
                        hover:font-bold
                    "
                >
                    {isOpen ? 'Hide' : 'Show'}
                </button>
            </div>

            {isOpen && (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <h4 className="text-md font-medium">Age Groups</h4>
                        {ageGroups.map((group) => (
                            <div key={group} className="flex items-center gap-2">
                                <span className="font-semibold">{group}:</span>
                                <span>{group.charAt(0)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2">
                        <h4 className="text-md font-medium">Categories</h4>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4" style={{ backgroundColor: 'var(--color-legend-blue)' }}></div>
                            <span>Male</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4" style={{ backgroundColor: 'var(--color-legend-rose)' }}></div>
                            <span>Female</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-dashed"></div>
                            <span>Not mandatory</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-0 border-dashed"></div>
                            <span>Occupant</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
