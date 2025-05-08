import React from 'react';
import { useData } from '../../../DataContext';
import RoomCell from '../RoomCell/RoomCell';
import { checkHardConstraints } from '../../../utils/checkHardConstraints';
import { NurseDetail } from '../NurseDetail/NurseDetail';
import { DayDetail } from '../DayDetail/DayDetail';
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
    const { inputData, solutionData, setSolutionData } = useData();
    const [selectedShift, setSelectedShift] = React.useState<ShiftType>('early');
    const [selectedNurseId, setSelectedNurseId] = React.useState<string | null>(inputData?.nurses[0]?.id || null);
    const [selectedDay, setselectedDay] = React.useState<number | null>(0);
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

    React.useEffect(() => {
        const errors = checkHardConstraints(inputData!, solutionData!);
        setErrorMessages(errors);
    }, [inputData, solutionData]);

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

    const handleDropNurse = (nurseId: string, newDay: number, newRoom: string) => {
        const nurse = solutionData.nurses.find(n => n.id === nurseId);
        if (!nurse) {
            setErrorMessages(prev => [...prev, `Nurse not found: ${nurseId}`]);
            return;
        }

        // ensure only one nurse per room/day/shift
        const conflict = solutionData.nurses.some(n =>
            n.id !== nurseId &&
            n.assignments.some(a => a.day === newDay && a.shift === selectedShift && a.rooms.includes(newRoom))
        );
        if (conflict) {
            setErrorMessages(prev => [...prev,
            `Room ${newRoom} already has a nurse for day ${newDay} shift ${selectedShift}`
            ]);
            return;
        }

        // Hard constraint: a nurse cannot be assigned to a room/shift where they are not scheduled to work (NursePresence)
        const assignment = nurse.assignments.find(a => a.day === newDay && a.shift === selectedShift);
        if (!assignment) {
            setErrorMessages(prev => [...prev, `Assignment not found for nurse ${nurseId} on day ${newDay} shift ${selectedShift}`]);
            return;
        }

        const previousRooms = [...assignment.rooms];

        const updatedNurses = solutionData.nurses.map(n => {
            if (n.id === nurseId) {
                const updatedAssignments = n.assignments.map(a => {
                    if (a.day === newDay && a.shift === selectedShift) {
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
            const nh = [...prev, { nurseId, day: newDay, shift: selectedShift, previousRooms }];
            return nh.length > MAX_HISTORY ? nh.slice(1) : nh;
        });

        const errors = checkHardConstraints(inputData, { ...solutionData, nurses: updatedNurses });
        setErrorMessages(errors);
        setSolutionData({ ...solutionData, nurses: updatedNurses });
    };

    const handleRemoveNurse = (
        nurseId: string,
        day: number,
        shift: ShiftType,
        roomId: string
    ) => {
        const nurse = solutionData.nurses.find(n => n.id === nurseId);
        if (!nurse) return;
        const assignment = nurse.assignments.find(a => a.day === day && a.shift === shift);
        const prevRooms = assignment ? [...assignment.rooms] : [];

        const updated = solutionData.nurses.map(n => {
            if (n.id !== nurseId) return n;
            const newAssignments = n.assignments.map(a => {
                if (a.day === day && a.shift === shift) {
                    return { ...a, rooms: a.rooms.filter(r => r !== roomId) };
                }
                return a;
            });
            return { ...n, assignments: newAssignments };
        });

        setDeltaHistory(prev => {
            const nh = [...prev, { nurseId, day, shift, previousRooms: prevRooms }];
            return nh.length > MAX_HISTORY ? nh.slice(1) : nh;
        });

        setSolutionData({ ...solutionData, nurses: updated });
        const errors = checkHardConstraints(inputData, { ...solutionData, nurses: updated });
        setErrorMessages(errors);
    };

    const handleUndo = () => {
        if (!deltaHistory.length) return;
        const last = deltaHistory[deltaHistory.length - 1];
        setDeltaHistory(prev => prev.slice(0, -1));
        const updated = solutionData.nurses.map(n => {
            if (n.id !== last.nurseId) return n;
            const newAssign = n.assignments.map(a => {
                if (a.day === last.day && a.shift === last.shift) {
                    return { ...a, rooms: last.previousRooms };
                }
                return a;
            });
            return { ...n, assignments: newAssign };
        });
        setSolutionData({ ...solutionData, nurses: updated });
        const errors = checkHardConstraints(inputData, { ...solutionData, nurses: updated });
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
    const onDayClick = (day: number) => setselectedDay(day);

    const unscheduledNurseInfos: NurseInfo[] = inputData.nurses.map(n => ({
        id: n.id,
        day: -1,
        room: 'unscheduled',
    }));

    return (
        <div className={solutionGridStyles.container}>
            <div className={solutionGridStyles.side}>
                {selectedDay != null && (
                    <div className={`${solutionGridStyles.side_content} mb-8`}>
                        <DayDetail day={selectedDay} shift={selectedShift} />
                    </div>
                )}
                {selectedNurseId && (
                    <div className={`${solutionGridStyles.side_content} mb-8`}>
                        <NurseDetail nurseId={selectedNurseId} />
                    </div>
                )}
                {errorMessages.length > 0 && (
                    <div className={`${solutionGridStyles.side_content}`}>
                        {errorMessages.map((msg, index) => (
                            <p key={index} className={solutionGridStyles.error_messages}>{msg}</p>
                        ))}
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
                                    <span
                                        onClick={() => onDayClick(day)}
                                        style={{
                                            cursor: 'pointer',
                                            textDecoration: selectedDay === day ? 'underline' : 'none'
                                        }}
                                    >
                                        Day {day}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {rooms.map(room => (
                            <div key={room.id} className="flex flex-row m-1 items-center">
                                <span className="min-w-[2rem]">{room.id}</span>
                                {Array.from({ length: days }).map((_, day) => (
                                    <div key={day} className="m-1 mb-4">
                                        <RoomCell
                                            day={day}
                                            shift={selectedShift}
                                            roomId={room.id}
                                            capacity={1} // In a specific shift and day, only one nurse can be assigned to a room
                                            nurses={gridData[day][room.id]}
                                            onDropNurse={handleDropNurse}
                                            onNurseClick={onNurseClick}
                                            onRemoveNurse={handleRemoveNurse}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>


                    <div className="flex flex-col ml-4">
                        <div className="flex flex-row gap-2 items-center">
                            <div className="min-w-[2rem]"></div>
                            <div className="min-w-[5.167rem]">
                                <span>Nurses</span>
                            </div>
                        </div>
                        <div className="flex flex-row m-1 items-center">
                            <span className="min-w-[2rem]"></span>
                            <div className="m-1">
                                <RoomCell
                                    day={-1}
                                    shift={selectedShift}
                                    roomId="unscheduled"
                                    capacity={inputData.nurses.length}
                                    nurses={unscheduledNurseInfos}
                                    onDropNurse={() => { }}
                                    onRemoveNurse={handleRemoveNurse}
                                    onNurseClick={onNurseClick}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
