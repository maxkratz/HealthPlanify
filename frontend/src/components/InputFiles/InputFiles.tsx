import React, { useState, useEffect } from 'react';
import Style from './InputFiles.module.scss';
import { useData } from '../../DataContext';
import { Link } from "react-router-dom";

const validateInputFile = (data: any): boolean => {
    if (typeof data.days !== 'number') return false;
    if (typeof data.skill_levels !== 'number') return false;
    if (!Array.isArray(data.shift_types)) return false;
    if (!Array.isArray(data.age_groups)) return false;
    if (typeof data.weights !== 'object') return false;

    const weightsKeys = [
        "room_mixed_age",
        "room_nurse_skill",
        "continuity_of_care",
        "nurse_eccessive_workload",
        "open_operating_theater",
        "surgeon_transfer",
        "patient_delay",
        "unscheduled_optional"
    ];
    for (const key of weightsKeys) {
        if (typeof data.weights[key] !== 'number') return false;
    }

    if (!Array.isArray(data.nurses)) return false;
    if (!Array.isArray(data.surgeons)) return false;
    if (!Array.isArray(data.operating_theaters)) return false;
    if (!Array.isArray(data.rooms)) return false;
    if (!Array.isArray(data.occupants)) return false;
    if (!Array.isArray(data.patients)) return false;

    // añadir más validaciones sit al 

    return true;
};

const validateSolutionFile = (data: any): boolean => {
    if (!Array.isArray(data.patients)) return false;
    if (!Array.isArray(data.nurses)) return false;

    for (const patient of data.patients) {
        if (typeof patient.id !== 'string') return false;
        if (typeof patient.admission_day === 'number') {
            // Si es un número, room y operating_theater deben existir y ser strings
            if (typeof patient.room !== 'string') return false;
            if (typeof patient.operating_theater !== 'string') return false;
        } else if (typeof patient.admission_day === 'string') {
            // Permitir "none"
            if (patient.admission_day !== 'none') return false;
            // En este caso, room y operating_theater pueden no estar definidos
        } else {
            return false;
        }
    }

    for (const nurse of data.nurses) {
        if (typeof nurse.id !== 'string') return false;
        if (!Array.isArray(nurse.assignments)) return false;
        for (const assignment of nurse.assignments) {
            if (typeof assignment.day !== 'number') return false;
            if (typeof assignment.shift !== 'string') return false;
            if (!Array.isArray(assignment.rooms)) return false;
        }
    }
    return true;
};

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
                        if (!validateInputFile(json)) {
                            alert("The uploaded input file does not follow the expected structure.");
                            return;
                        }
                        setInputData(json);
                        setInputUploaded(true);
                        setInputFileName(file.name);
                    } else {
                        if (!validateSolutionFile(json)) {
                            alert("The uploaded solution file does not follow the expected structure.");
                            return;
                        }
                        setSolutionData(json);
                        setOutputUploaded(true);
                        setSolutionFileName(file.name);
                    }
                } catch (error) {
                    console.error("Error parsing JSON", error);
                    alert("Error parsing JSON file.");
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
