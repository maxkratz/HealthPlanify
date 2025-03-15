import React from 'react';
import { Link, useParams } from 'react-router-dom';
import NurseStyle from './Nurse.module.scss';
import { AssignedPatient } from '../../views/Nurse/NursesList/NursesList';

export type NurseComponentProps = {
    nurseId: string;
    skillLevel: number;
    maxLoad: number;
    assignedPatients: AssignedPatient[];
    assignedRooms: string[];
};

export const Nurse: React.FC<NurseComponentProps> = ({
    nurseId,
    skillLevel,
    maxLoad,
    assignedPatients,
    assignedRooms,
    ...props
}) => {
    const { branch, dayIndex, shiftType } = useParams<{ branch: string, dayIndex: string, shiftType: string }>();

    const actualLoad = assignedPatients.reduce((sum, patient) => sum + patient.workload, 0);
    let modifier = 'free';
    if (actualLoad > maxLoad) {
        modifier = 'overfull';
    } else if (actualLoad == maxLoad) {
        modifier = 'full';
    } else if (actualLoad >= maxLoad * 0.5) {
        modifier = 'half';
    }
    const containerClassName = `${NurseStyle.container} ${NurseStyle[`container--${modifier}`]}`;

    const nurseData = {
        nurseId: nurseId,
        skillLevel: skillLevel,
        maxLoad: maxLoad,
        assignedPatients: assignedPatients,
        assignedRooms: assignedRooms,
    };

    return (
        <div>
            <Link
                to={`/FirstElection/${branch}/SecondElection/Calendar/${dayIndex}/Shifts/${shiftType}/NursesList/${nurseId}`}
                state={{ nurseData }} // Necessary for NurseDetails
            >
                <div className={containerClassName}>
                    <span {...props}><strong>Nurse: </strong>{nurseId}</span>
                    <span {...props}><strong>Max Load: </strong>{maxLoad}</span>
                    <span {...props}><strong>Actual Load: </strong>{actualLoad}</span>
                </div>
            </Link>
        </div>
    );
};
