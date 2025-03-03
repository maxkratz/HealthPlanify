import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Nurse } from '../../components/Nurse/Nurse';
import { useData } from "../../DataContext";

export const Nurses: React.FC = () => {
    const { branch, dayIndex, shiftType } = useParams();
    const data = useData();
    const dayNumber = Number(dayIndex);

    // filtramos enfermeras que tienen asignado el turno en el día y shift actuales
    const availableNurses = data.inputData?.nurses.filter(nurse =>
        nurse.working_shifts.some(ws => ws.day === dayNumber && ws.shift === shiftType)
    ) || [];

    return (
        <div className="flex items-center justify-center flex-row flex-wrap m-4 gap-4">
            {availableNurses.map((nurse) => {
                // Buscar asignacióm (working_shift) correspondiente al día y shift
                const workingShift = nurse.working_shifts.find(
                    ws => ws.day === dayNumber && ws.shift === shiftType
                );
                const maxLoad = workingShift ? workingShift.max_load : 0;

                return (
                    <Link
                        key={nurse.id}
                        to={`/FirstElection/${branch}/Calendar/${dayIndex}/Shifts/${shiftType}/Nurses/${nurse.id}`}
                    >
                        <Nurse nurseId={nurse.id} skillLevel={nurse.skill_level} maxLoad={maxLoad} />
                    </Link>
                );
            })}
        </div>
    );
};
