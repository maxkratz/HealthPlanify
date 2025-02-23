// DataContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface DataContextType {
  inputData: any;
  outputData: any;
  setInputData: (data: any) => void;
  setOutputData: (data: any) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [inputData, setInputData] = useState(null);
  const [outputData, setOutputData] = useState(null);

  return (
    <DataContext.Provider value={{ inputData, outputData, setInputData, setOutputData }}>
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
