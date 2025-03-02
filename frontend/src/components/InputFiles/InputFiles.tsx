import React, { useState, useEffect } from 'react';
import Style from './InputFiles.module.scss';
import { useData } from '../../DataContext';
import { Link } from "react-router-dom";

export const InputFiles: React.FC = () => {
    const { setInputData, setSolutionData } = useData();

    const [inputUploaded, setInputUploaded] = useState(false);
    const [outputUploaded, setOutputUploaded] = useState(false);
    const [filesUploaded, setFilesUploaded] = useState(false);

    const [inputFileName, setInputFileName] = useState('');
    const [solutionFileName, setSolutionFileName] = useState('');

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
                        setInputFileName(file.name);
                    } else {
                        setSolutionData(json);
                        setOutputUploaded(true);
                        setSolutionFileName(file.name);
                    }
                } catch (error) {
                    console.error("Error al parsear el JSON", error);
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className='flex flex-col gap-2'>
            <div>
                <label>Input file: </label>

                {!inputFileName && (
                    <label htmlFor="inputFile" className={Style.customFileLabel}>
                        Upload file
                    </label>
                )}

                <input
                    id="inputFile"
                    type="file"
                    accept=".json"
                    onChange={(e) => handleFileUpload(e, 'input')}
                    className={Style.hiddenInput}
                />

                <span className={Style.fileName}>
                    {inputFileName || ''}
                </span>
            </div>



            <div className='mb-8'>
                <label>Solution file: </label>

                {!solutionFileName && (
                    <label htmlFor="solutionFile" className={Style.customFileLabel}>
                        Upload file
                    </label>
                )}

                <input
                    id="solutionFile"
                    type="file"
                    accept=".json"
                    onChange={(e) => handleFileUpload(e, 'output')}
                    className={Style.hiddenInput}
                />

                <span className={Style.fileName}>
                    {solutionFileName || ''}
                </span>
            </div>



            {filesUploaded && (
                <nav>
                    <Link to="/FirstElection">Continue</Link>
                </nav>
            )}
        </div>
    );
};
