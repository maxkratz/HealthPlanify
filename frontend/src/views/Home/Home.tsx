import React from 'react'
import styles from './Home.module.scss'
import backgroundImage from '../../assets/home.png'
import { InputFiles } from '../../components/InputFiles'

export const Home: React.FC = () => (
    <div className={styles.container}>
        <div className={styles.leftPane}>
            <h1 className={styles.heading}>Resual</h1>
            <h2 className={styles.subheading}>A healthcare timetable visualizer</h2>
            <InputFiles />
        </div>
        <div className={styles.rightPane}>
            <img
                src={backgroundImage}
                alt="Descripción"
                className={styles.image}
            />
        </div>
    </div>
)
