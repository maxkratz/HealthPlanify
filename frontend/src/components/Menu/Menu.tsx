import React, { useState, CSSProperties } from 'react';
import { List, X } from 'phosphor-react';
import { Link } from 'react-router-dom';
import styles from './Menu.module.scss';
import backgroundImage from '../../assets/2.jpg';

export const Menu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => setIsOpen(open => !open);

    const imageStyle: CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '50vw',
        height: '100%',
        objectFit: 'cover',
        zIndex: 998,
    };

    return (
        <>
            <button
                onClick={toggleMenu}
                className={styles.menuButton}
                aria-label="Toggle menu"
            >
                {isOpen
                    ? <X size={24} weight="fill" />
                    : <List size={24} weight="fill" />
                }
            </button>

            {isOpen && (
                <img
                    src={backgroundImage}
                    alt="Descripción de la imagen"
                    style={imageStyle}
                />
            )}

            <nav
                className={`${styles.menu} ${isOpen ? styles.open : ''}`}
                aria-hidden={!isOpen}
            >
                <Link to="/FirstElection/Rooms/SecondElection" className={styles.menuItem}>
                    Rooms
                </Link>
                <Link to="/FirstElection/Nurses/SecondElection" className={styles.menuItem}>
                    Nurses
                </Link>
                <Link to="/FirstElection/Surgeons/SecondElection" className={styles.menuItem}>
                    Surgeons
                </Link>
                <Link to="/FirstElection/OperatingTheaters/SecondElection" className={styles.menuItem}>
                    Operating Theaters
                </Link>
                <Link to="/FirstElection/Patients" className={styles.menuItem}>
                    Patients
                </Link>
                <Link to="/FirstElection/PatientScheduler" className={styles.menuItem}>
                    Patient Scheduler
                </Link>
                <Link to="/FirstElection/NurseScheduler" className={styles.menuItem}>
                    Nurse Scheduler
                </Link>
            </nav>
        </>
    );
};
