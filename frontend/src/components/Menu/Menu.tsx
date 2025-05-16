import React, { useState } from 'react';
import { List, X } from 'phosphor-react';
import { Link } from 'react-router-dom';
import styles from './Menu.module.scss';

import defaultImg from '../../assets/home.png';
import roomsImg from '../../assets/rooms.png';
import nursesImg from '../../assets/nurses.png';
import surgeonsImg from '../../assets/surgeons.png';
import theatersImg from '../../assets/operatingTheaters.png';
import patientsImg from '../../assets/patients.png';
import patientSchedulerImg from '../../assets/patientScheduler.png';
import nurseSchedulerImg from '../../assets/nurseScheduler.png';


const hoverImages: Record<string, string> = {
    Rooms: roomsImg,
    Nurses: nursesImg,
    Surgeons: surgeonsImg,
    'Operating Theaters': theatersImg,
    Patients: patientsImg,
    'Patient Scheduler': patientSchedulerImg,
    'Nurse Scheduler': nurseSchedulerImg,
};

export const Menu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentImg, setCurrentImg] = useState<string>(defaultImg);

    const toggleMenu = () => setIsOpen(open => !open);
    const closeMenu = () => setIsOpen(false);

    const handleMouseEnter = (label: string) => {
        setCurrentImg(hoverImages[label] || defaultImg);
    };

    const handleMouseLeave = () => {
        setCurrentImg(defaultImg);
    };

    const items = [
        'Rooms',
        'Nurses',
        'Surgeons',
        'Operating Theaters',
        'Patients',
        'Patient Scheduler',
        'Nurse Scheduler',
    ];

    return (
        <>
            <button
                onClick={toggleMenu}
                className={`${styles.menuButton} ${isOpen ? styles.openButton : ''}`}
                aria-label="Toggle menu"
            >
                {isOpen
                    ? <X size={40} weight="fill" />
                    : <List size={40} weight="fill" />
                }
            </button>

            <img
                src={currentImg}
                alt="Vista previa"
                className={`${styles.menuImage} ${isOpen ? styles.visible : ''}`}
            />

            <nav
                className={`${styles.menu} ${isOpen ? styles.open : ''}`}
                aria-hidden={!isOpen}
            >
                {items.map(label => (
                    <Link
                        key={label}
                        to={`/${label.replace(/\s+/g, '')}/Election`}
                        className={styles.menuItem}
                        onMouseEnter={() => handleMouseEnter(label)}
                        onMouseLeave={handleMouseLeave}
                        onClick={closeMenu}
                    >
                        {label}
                    </Link>
                ))}
            </nav>
        </>
    );
};
