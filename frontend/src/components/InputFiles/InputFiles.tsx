import React from 'react';
import { useData } from '../../DataContext';

export const InputFiles: React.FC = () => {
  const { setInputData, setOutputData } = useData();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'input' | 'output') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (type === 'input') {
            setInputData(json);
          } else {
            setOutputData(json);
          }
        } catch (error) {
          console.error("Error al parsear el JSON", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <div>
        <label>Archivo de entrada:</label>
        <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'input')} />
      </div>
      <div>
        <label>Archivo de salida:</label>
        <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'output')} />
      </div>
    </div>
  );
};