import React, { useState } from 'react';
import { List, X } from 'phosphor-react';
import { Link } from 'react-router-dom';
import styles from './Menu.module.scss';
import backgroundImage from '../../assets/2.jpg';

export const Menu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => setIsOpen(open => !open);
    const closeMenu = () => setIsOpen(false);

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
                src={backgroundImage}
                alt="Descripción de la imagen"
                className={`${styles.menuImage} ${isOpen ? styles.visible : ''}`}
            />

            <nav
                className={`${styles.menu} ${isOpen ? styles.open : ''}`}
                aria-hidden={!isOpen}
            >
                <Link to="/FirstElection/Rooms/SecondElection" className={styles.menuItem} onClick={closeMenu}>
                    Rooms
                </Link>
                <Link to="/FirstElection/Nurses/SecondElection" className={styles.menuItem} onClick={closeMenu}>
                    Nurses
                </Link>
                <Link to="/FirstElection/Surgeons/SecondElection" className={styles.menuItem} onClick={closeMenu}>
                    Surgeons
                </Link>
                <Link to="/FirstElection/OperatingTheaters/SecondElection" className={styles.menuItem} onClick={closeMenu}>
                    Operating Theaters
                </Link>
                <Link to="/FirstElection/Patients" className={styles.menuItem} onClick={closeMenu}>
                    Patients
                </Link>
                <Link to="/FirstElection/PatientScheduler" className={styles.menuItem} onClick={closeMenu}>
                    Patient Scheduler
                </Link>
                <Link to="/FirstElection/NurseScheduler" className={styles.menuItem} onClick={closeMenu}>
                    Nurse Scheduler
                </Link>
            </nav>
        </>
    );
};
