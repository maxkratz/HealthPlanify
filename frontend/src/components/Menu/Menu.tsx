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

import { motion, AnimatePresence } from 'framer-motion';

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
    const [currentImg, setCurrentImg] = useState(defaultImg);

    const toggleMenu = () => setIsOpen(o => !o);
    const closeMenu = () => setIsOpen(false);

    const handleMouseEnter = (label: string) => {
        setCurrentImg(hoverImages[label] ?? defaultImg);
    };
    const handleMouseLeave = () => {
        setCurrentImg(defaultImg);
    };

    const items = [
        { label: 'Rooms', to: '/Rooms/Calendar' },
        { label: 'Nurses', to: '/Nurses/Options' },
        { label: 'Surgeons', to: '/Surgeons/Options' },
        { label: 'Operating Theaters', to: '/OperatingTheaters/Options' },
        { label: 'Patients', to: '/Patients' },
        { label: 'Patient Scheduler', to: '/PatientScheduler' },
        { label: 'Nurse Scheduler', to: '/NurseScheduler' },
    ];

    return (
        <>
            <button
                onClick={toggleMenu}
                className={`${styles.menuButton} ${isOpen ? styles.openButton : ''}`}
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={40} weight="fill" /> : <List size={40} weight="fill" />}
            </button>

            {isOpen && (
                <div className={styles.imageWrapper}>
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImg}
                            src={currentImg}
                            initial={{ opacity: 0, filter: 'blur(1.25rem)' }}
                            animate={{ opacity: 1, filter: 'blur(0)' }}
                            exit={{ opacity: 0, filter: 'blur(1.25rem)' }}
                            transition={{ duration: 0.3 }}
                            className={styles.menuImage}
                            alt="Vista previa"
                        />
                    </AnimatePresence>
                </div>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.nav
                        className={styles.menu}
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        aria-hidden={!isOpen}
                    >
                        {items.map(({ label, to }) => (
                            <Link
                                key={label}
                                to={to}
                                className={styles.menuItem}
                                onMouseEnter={() => handleMouseEnter(label)}
                                onMouseLeave={handleMouseLeave}
                                onClick={closeMenu}
                            >
                                {label}
                            </Link>
                        ))}
                    </motion.nav>
                )}
            </AnimatePresence>
        </>
    );
};
