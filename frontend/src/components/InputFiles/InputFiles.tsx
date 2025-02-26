import React, { useState, useEffect } from 'react';
import Style from './InputFiles.module.scss';
import { useData } from '../../DataContext';
import { Link } from "react-router-dom";

export const InputFiles: React.FC = () => {
    const { setInputData, setSolutionData } = useData();

    // Estados para controlar la subida de cada fichero
    const [inputUploaded, setInputUploaded] = useState(false);
    const [outputUploaded, setOutputUploaded] = useState(false);
    // Estado que se pone a true cuando ambos archivos han sido subidos
    const [filesUploaded, setFilesUploaded] = useState(false);

    // Cuando cambie alguno de los estados, comprobamos si ya se subieron ambos
    useEffect(() => {
        if (inputUploaded && outputUploaded) {
            setFilesUploaded(true);
        }
    }, [inputUploaded, outputUploaded]);

    const handleFileUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'input' | 'output'
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target?.result as string);
                    if (type === 'input') {
                        setInputData(json);
                        setInputUploaded(true);
                    } else {
                        setSolutionData(json);
                        setOutputUploaded(true);
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
                <label>Input File: </label>
                <input
                    className={Style.input}
                    type="file"
                    accept=".json"
                    onChange={(e) => handleFileUpload(e, 'input')}
                />
            </div>
            <div>
                <label>Solution File: </label>
                <input
                    className={Style.input}
                    type="file"
                    accept=".json"
                    onChange={(e) => handleFileUpload(e, 'output')}
                />
            </div>
            {filesUploaded && (
                <nav>
                    <Link to="/FirstElection">Continue</Link>
                </nav>
            )}
        </div>
    );
};
