import React from 'react';
import { useData } from '../../../DataContext';
import RoomCell from '../RoomCell/RoomCell';
import { checkHardConstraints } from '../../../utils/checkHardConstraints';
import { NurseDetail } from '../NurseDetail/NurseDetail';
import { DayDetail } from '../DayDetail/DayDetail';
import solutionGridStyles from './NurseScheduler.module.scss';
import { checkSoftConstraintsCost } from '../../../utils/checkSoftConstraints';
import { ShiftType } from '../../../types/types';
import { Button } from '../../../components/Button/Button';

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
    replacedNurseId?: string;
    replacedPreviousRooms?: string[];
}

export const NurseScheduler = () => {
    const { inputData, solutionData, setSolutionData } = useData();
    const [selectedShift, setSelectedShift] = React.useState<ShiftType>('early');
    const [selectedNurseId, setSelectedNurseId] = React.useState<string | null>(inputData?.nurses[0]?.id || null);
    const [selectedDay, setselectedDay] = React.useState<number | null>(0);
    const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
    const MAX_HISTORY = 50;

    const [deltaHistory, setDeltaHistory] = React.useState<NurseDelta[]>(() => {
        const persisted = localStorage.getItem('deltaHistory');
        if (persisted) {
            try { return JSON.parse(persisted); } catch { console.error('Error parsing deltaHistory'); }
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
            const nursesInRoom = solutionData.nurses
                .filter(n => n.assignments.some(a => a.day === d && a.shift === selectedShift && a.rooms.includes(room.id)))
                .map(n => ({ id: n.id, day: d, room: room.id }));
            gridData[d][room.id] = nursesInRoom;
        });
    }

    const handleDropNurse = (nurseId: string, newDay: number, newRoom: string) => {
        const nurse = solutionData.nurses.find(n => n.id === nurseId)!;

        // Validate that the nurse can work on this day and shift
        const inputNurse = inputData.nurses.find(n => n.id === nurseId);
        if (!inputNurse) {
            setErrorMessages(prev => [...prev, `Nurse not found: ${nurseId}`]);
            return;
        }
        const working_shift = inputNurse.working_shifts.find(ws => ws.day === newDay && ws.shift === selectedShift);
        if (!working_shift) {
            setErrorMessages(prev => [
                ...prev,
                `Working shift not found for nurse ${nurseId} on day ${newDay} shift ${selectedShift}`
            ]);
            return;
        }

        // Record previous rooms for dragged nurse
        let previousRooms: string[] = [];
        const assignment = nurse.assignments.find(a => a.day === newDay && a.shift === selectedShift);
        if (assignment) {
            previousRooms = [...assignment.rooms];
        }

        // Find any nurse currently holding this room
        const replacedNurse = solutionData.nurses.find(n =>
            n.id !== nurseId && n.assignments.some(a => a.day === newDay && a.shift === selectedShift && a.rooms.includes(newRoom))
        );
        let replacedPreviousRooms: string[] | undefined;
        if (replacedNurse) {
            const repAssign = replacedNurse.assignments.find(a => a.day === newDay && a.shift === selectedShift)!;
            replacedPreviousRooms = [...repAssign.rooms];
        }

        const updatedNurses = solutionData.nurses.map(n => {
            const newAssignments = [...n.assignments];

            const assignmentIndex = newAssignments.findIndex(a => a.day === newDay && a.shift === selectedShift);

            if (assignmentIndex !== -1) {
                const a = newAssignments[assignmentIndex];
                if (n.id === nurseId) {
                    // Add room
                    newAssignments[assignmentIndex] = { ...a, rooms: Array.from(new Set([...a.rooms, newRoom])) };
                } else if (replacedNurse && n.id === replacedNurse.id) {
                    // Remove room
                    newAssignments[assignmentIndex] = { ...a, rooms: a.rooms.filter(r => r !== newRoom) };
                }
            } else if (n.id === nurseId) {
                // No assignment yet — create one with the new room
                newAssignments.push({
                    day: newDay,
                    shift: selectedShift,
                    rooms: [newRoom],
                });
            }

            return { ...n, assignments: newAssignments };
        });


        // Push delta with both changes
        setDeltaHistory(prev => {
            const delta: NurseDelta = {
                nurseId,
                day: newDay,
                shift: selectedShift,
                previousRooms,
                replacedNurseId: replacedNurse?.id,
                replacedPreviousRooms,
            };
            const list = [...prev, delta];
            return list.length > MAX_HISTORY ? list.slice(list.length - MAX_HISTORY) : list;
        });

        setSolutionData({ ...solutionData, nurses: updatedNurses });
    };

    const handleUndo = () => {
        if (!deltaHistory.length) return;
        const last = deltaHistory[deltaHistory.length - 1];
        setDeltaHistory(prev => prev.slice(0, -1));

        const restoredNurses = solutionData.nurses.map(n => {
            const newAssignments = n.assignments.map(a => {
                if (a.day === last.day && a.shift === last.shift) {
                    if (n.id === last.nurseId) {
                        // restore dragged nurse
                        return { ...a, rooms: last.previousRooms };
                    }
                    if (last.replacedNurseId && n.id === last.replacedNurseId && last.replacedPreviousRooms) {
                        // restore replaced nurse
                        return { ...a, rooms: last.replacedPreviousRooms };
                    }
                }
                return a;
            });
            return { ...n, assignments: newAssignments };
        });

        setSolutionData({ ...solutionData, nurses: restoredNurses });
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
                    <div className={`mb-8`}>
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
                        <h3 className="text-center">Violations</h3>
                        {errorMessages.map((msg, index) => (
                            <p key={index} className={solutionGridStyles.error_messages}>{msg}</p>
                        ))}
                    </div>
                )}
            </div>


            <div className={solutionGridStyles.center}>
                <div className='mb-24'>
                    <h1>Nurse Scheduler</h1>
                </div>


                <div className="flex flex-row items-center justify-center gap-16 mb-20">
                    <Button
                        onClick={handleUndo}
                        disabled={deltaHistory.length === 0}
                    >
                        Undo changes
                    </Button>

                    <span>Total cost {checkSoftConstraintsCost(inputData, solutionData)}</span>

                    <Button onClick={handleDownloadSolution}>
                        Download solution
                    </Button>
                </div>


                <div className="flex flex-col items-center justify-center mb-16">
                    <span className="text-[var(--color-blue)]">Shift Selector</span>
                    <div className="flex flex-row items-center justify-center gap-8 mt-8">
                        {inputData.shift_types.map(shift => (
                            <Button
                                key={shift}
                                onClick={() => setSelectedShift(shift)}
                                active={selectedShift === shift}
                            >
                                {shift}
                            </Button>
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
                                        className={
                                            selectedDay === day
                                                ? `${solutionGridStyles.dayLabel} ${solutionGridStyles['dayLabel--selected']}`
                                                : solutionGridStyles.dayLabel
                                        }
                                    >
                                        Day {day+1}
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
