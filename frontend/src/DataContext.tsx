import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InputFile } from './types/InputFile';
import { SolutionFile } from './types/SolutionFile';

interface DataContextType {
    inputData: InputFile | null;
    solutionData: SolutionFile | null;
    setInputData: (data: InputFile | null) => void;
    setSolutionData: (data: SolutionFile | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [inputData, setInputData] = useState<InputFile | null>(() => {
        const storedInput = localStorage.getItem("inputData");
        return storedInput ? JSON.parse(storedInput) : null;
    });

    const [solutionData, setSolutionData] = useState<SolutionFile | null>(() => {
        const storedSolution = localStorage.getItem("solutionData");
        return storedSolution ? JSON.parse(storedSolution) : null;
    });

    useEffect(() => {
        if (inputData) {
            localStorage.setItem("inputData", JSON.stringify(inputData));
        } else {
            localStorage.removeItem("inputData");
        }
    }, [inputData]);

    useEffect(() => {
        if (solutionData) {
            localStorage.setItem("solutionData", JSON.stringify(solutionData));
        } else {
            localStorage.removeItem("solutionData");
        }
    }, [solutionData]);

    return (
        <DataContext.Provider value={{ inputData, solutionData, setInputData, setSolutionData }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};
