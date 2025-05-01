import React from 'react';
import { useData } from '../../../DataContext';
import RoomCell from '../RoomCell/RoomCell';
import { checkHardConstraints } from '../../../utils/checkHardConstraints';
import { NurseDetail } from '../NurseDetail/NurseDetail';
import { DayDetail } from '../DayDetail/DayDetail';
import { Legend } from '../Legend/Legend';
import solutionGridStyles from './NurseScheduler.module.scss';
import { checkSoftConstraintsCost } from '../../../utils/checkSoftConstraints';
import { ShiftType } from '../../../types/types';

export interface NurseInfo {
    id: string;
    day: number;
    room: string;
}

interface NurseDelta {
    nurseId: string;
    day: number;
    shift: ShiftType;
    previousRooms: string[];
}

export const NurseScheduler = () => {
    const [selectedShift, setSelectedShift] = React.useState<ShiftType>('early');
    const [selectedNurseId, setSelectedNurseId] = React.useState<string | null>(null);
    const [selectedDay, setSelectedDay] = React.useState<number | null>(null);
    const { inputData, solutionData, setSolutionData } = useData();
    const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
    const MAX_HISTORY = 10;

    const [deltaHistory, setDeltaHistory] = React.useState<NurseDelta[]>(() => {
        const persistedDeltas = localStorage.getItem('deltaHistory');
        if (persistedDeltas) {
            try {
                return JSON.parse(persistedDeltas);
            } catch (error) {
                console.error('Error al parsear deltaHistory', error);
            }
        }
        return [];
    });

    React.useEffect(() => {
        localStorage.setItem('deltaHistory', JSON.stringify(deltaHistory));
    }, [deltaHistory]);

    if (!inputData || !solutionData) {
        return <div>Ups, something went wrong! No data loaded.</div>;
    }

    const days = inputData.days;
    const rooms = inputData.rooms;

    const gridData: { [day: number]: { [roomId: string]: NurseInfo[] } } = {};
    for (let d = 0; d < days; d++) {
        gridData[d] = {};
        rooms.forEach(room => {
            const nursesInRoom: NurseInfo[] = solutionData.nurses
                .filter(nurseOutput =>
                    nurseOutput.assignments.some(assig =>
                        assig.day === d &&
                        assig.shift === selectedShift &&
                        assig.rooms.includes(room.id)
                    )
                )
                .map(nurseOutput => ({
                    id: nurseOutput.id,
                    day: d,
                    room: room.id,
                }));
            gridData[d][room.id] = nursesInRoom;
        });
    }

    const handleDropNurse = (nurseId: string, newRoom: string) => {
        const nurse = solutionData.nurses.find(n => n.id === nurseId);
        if (!nurse) return console.error("Nurse not found:", nurseId);

        const assignment = nurse.assignments.find(a => a.day === selectedDay && a.shift === selectedShift);
        if (!assignment) return console.error("Assignment not found for nurse", nurseId, selectedDay, selectedShift);

        const previousRooms = [...assignment.rooms];

        const updatedNurses = solutionData.nurses.map(n => {
            if (n.id === nurseId) {
                const updatedAssignments = n.assignments.map(a => {
                    if (a.day === selectedDay && a.shift === selectedShift) {
                        const newRooms = Array.from(new Set([...a.rooms.filter(r => r !== newRoom), newRoom]));
                        return { ...a, rooms: newRooms };
                    }
                    return a;
                });
                return { ...n, assignments: updatedAssignments };
            }
            return n;
        });

        setDeltaHistory(prev => {
            const nh = [...prev, { nurseId, day: selectedDay!, shift: selectedShift, previousRooms }];
            return nh.length > MAX_HISTORY ? nh.slice(1) : nh;
        });

        const errors = checkHardConstraints(inputData, { ...solutionData, nurses: updatedNurses });
        setErrorMessages(errors);
        setSolutionData({ ...solutionData, nurses: updatedNurses });
    };

    const handleUndo = () => {
        if (deltaHistory.length === 0) return;
        const lastChange = deltaHistory[deltaHistory.length - 1];
        setDeltaHistory(prev => prev.slice(0, prev.length - 1));

        const updatedNurses = solutionData.nurses.map(n => {
            if (n.id === lastChange.nurseId) {
                const updatedAssignments = n.assignments.map(a => {
                    if (a.day === lastChange.day && a.shift === lastChange.shift) {
                        return { ...a, rooms: lastChange.previousRooms };
                    }
                    return a;
                });
                return { ...n, assignments: updatedAssignments };
            }
            return n;
        });

        setSolutionData({ ...solutionData, nurses: updatedNurses });
        const errors = checkHardConstraints(inputData, { ...solutionData, nurses: updatedNurses });
        setErrorMessages(errors);
    };

    const handleDownloadSolution = () => {
        const fileData = JSON.stringify(solutionData, null, 2);
        const blob = new Blob([fileData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'solution.json';
        link.click();
        URL.revokeObjectURL(url);
    };

    const onNurseClick = (nurseId: string) => setSelectedNurseId(nurseId);
    const onDayClick = (day: number) => setSelectedDay(day);

    return (
        <div className={solutionGridStyles.container}>
            <div className={solutionGridStyles.side}>
                <div className={`${solutionGridStyles.side_content} mb-8`}>
                    <Legend />
                </div>

                {errorMessages.length > 0 && (
                    <div className={`${solutionGridStyles.side_content} mb-8`}>
                        {errorMessages.map((msg, index) => (
                            <p key={index} className={solutionGridStyles.error_messages}>{msg}</p>
                        ))}
                    </div>
                )}
                {selectedNurseId && (
                    <div className={`${solutionGridStyles.side_content} mb-8`}>
                        <NurseDetail nurseId={selectedNurseId} />
                    </div>
                )}
                {selectedDay != null && (
                    <div className={`${solutionGridStyles.side_content}`}>
                        <DayDetail day={selectedDay} />
                    </div>
                )}
            </div>


            <div className={solutionGridStyles.center}>
                <div className='flex flex-row items-center justify-center gap-16 mb-20'>
                    <button onClick={handleUndo} disabled={deltaHistory.length === 0} className={solutionGridStyles.undo_button}>
                        Undo changes
                    </button>
                    <span>Total cost {checkSoftConstraintsCost(inputData, solutionData)}</span>
                    <button onClick={handleDownloadSolution} className={solutionGridStyles.undo_button}>
                        Download solution
                    </button>
                </div>

                <div className='flex flex-col items-center justify-center mb-16'>
                    <span>Shift Selector</span>
                    <div className='flex flex-row items-center justify-center gap-8 mt-8'>
                        {inputData.shift_types.map(shift => (
                            <button
                                key={shift}
                                onClick={() => setSelectedShift(shift)}
                                className={selectedShift === shift ? solutionGridStyles.activeButton : solutionGridStyles.button}
                            >
                                {shift}
                            </button>
                        ))}
                    </div>
                </div>


                <div className="flex flex-row">
                    <div className="flex flex-col">
                        <div className="flex flex-row gap-2 items-center">
                            <div className="min-w-[2rem]"></div>
                            {Array.from({ length: days }).map((_, day) => (
                                <div key={day} className="min-w-[5.167rem]">
                                    <span onClick={() => onDayClick(day)} style={{ cursor: 'pointer' }}>Day {day}</span>
                                </div>
                            ))}
                        </div>
                        {rooms.map(room => (
                            <div key={room.id} className="flex flex-row m-1 items-center">
                                <span className="min-w-[2rem]">{room.id}</span>
                                {Array.from({ length: days }).map((_, day) => (
                                    <div key={day} className="m-1">
                                        <RoomCell
                                            day={day}
                                            roomId={room.id}
                                            capacity={room.capacity}
                                            nurses={gridData[day][room.id]}
                                            onDropNurse={handleDropNurse}
                                            onNurseClick={onNurseClick}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
