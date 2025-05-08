import React, { useState, useRef, useEffect } from 'react';
import Style from './InputFiles.module.scss';
import { useData } from '../../DataContext';
import { useNavigate } from 'react-router-dom';

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

    return true;
};

const validateSolutionFile = (data: any): boolean => {
    if (!Array.isArray(data.patients)) return false;
    if (!Array.isArray(data.nurses)) return false;

    for (const patient of data.patients) {
        if (typeof patient.id !== 'string') return false;
        if (typeof patient.admission_day === 'number') {
            if (typeof patient.room !== 'string') return false;
            if (typeof patient.operating_theater !== 'string') return false;
        } else if (typeof patient.admission_day === 'string') {
            if (patient.admission_day !== 'none') return false;
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
    const navigate = useNavigate();

    const [inputFileName, setInputFileName] = useState('');
    const [solutionFileName, setSolutionFileName] = useState('');
    const [inputJson, setInputJson] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ready, setReady] = useState(false);
    const solutionInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ready) {
            navigate('/FirstElection');
        }
    }, [ready, navigate]);

    const readJsonFile = (
        file: File,
        onJson: (json: any) => void,
        onInvalid: () => void
    ) => {
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const json = JSON.parse(ev.target?.result as string);
                onJson(json);
            } catch {
                onInvalid();
            }
        };
        reader.readAsText(file);
    };

    const handleInputUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        readJsonFile(
            file,
            json => {
                if (!validateInputFile(json)) {
                    alert('The instance file does not follow the expected structure.');
                    return;
                }
                setInputData(json);
                setInputJson(json);
                setInputFileName(file.name);
                setError(null);
            },
            () => alert('Error reading instance JSON file.')
        );
    };

    const handleSolutionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        readJsonFile(
            file,
            json => {
                if (!validateSolutionFile(json)) {
                    alert('The solution file does not follow the expected structure.');
                    return;
                }
                setSolutionData(json);
                setSolutionFileName(file.name);
                setReady(true);
                setError(null);
            },
            () => alert('Error reading solution JSON file.')
        );
    };

    const fetchSolution = async () => {
        if (!inputJson || !inputFileName) return;
        setLoading(true);
        setError(null);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120_000);

            const url = `/api/solve?file=${encodeURIComponent(inputFileName)}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inputJson),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                const serverMsg = payload.error ?? payload.message ?? response.statusText;
                throw new Error(serverMsg);
            }

            const sol = payload;
            if (!validateSolutionFile(sol)) {
                throw new Error('The solution response does not follow the expected structure.');
            }

            setSolutionData(sol);
            setSolutionFileName(`sol_${inputFileName}`);
            setReady(true);
        } catch (err: any) {
            setError(
                err.name === 'AbortError'
                    ? 'Timeout reached (2 min).'
                    : err.message || 'Error fetching solution.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <label>Instance file (JSON): </label>
                {!inputFileName ? (
                    <label htmlFor="inputFile" className={Style.customFileLabel}>
                        upload file
                    </label>
                ) : (
                    <span className={Style.fileName}>{inputFileName}</span>
                )}
                <input
                    id="inputFile"
                    type="file"
                    accept=".json"
                    onChange={handleInputUpload}
                    className={Style.hiddenInput}
                    disabled={loading}
                />
            </div>

            {inputFileName && !solutionFileName && (
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => solutionInputRef.current?.click()}
                        disabled={loading}
                        className={Style.btn}
                    >
                        Upload solution file
                    </button>
                    <input
                        ref={solutionInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleSolutionUpload}
                        className="hidden"
                    />

                    <button
                        onClick={fetchSolution}
                        disabled={loading}
                        className={Style.btn}
                    >
                        Get solution from API
                    </button>
                </div>
            )}

            {loading && (
                <div className="flex items-center gap-2">
                    <div className="loader" />
                    <span>Processing...</span>
                </div>
            )}

            {error && <div className="text-red-600">{error}</div>}

        </div>
    );
};
