// DataContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { InputFile } from './types/InputFile';
import { SolutionFile } from './types/SolutionFile';

interface DataContextType {
  inputData: InputFile | null;
  solutionData: SolutionFile | null;
  setInputData: (data: any) => void;
  setSolutionData: (data: any) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [inputData, setInputData] = useState(null);
  const [solutionData, setSolutionData] = useState(null);

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
