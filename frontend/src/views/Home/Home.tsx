// import HomeStyle from './home.module.scss'

import React from 'react'
import { InputFiles } from '../../components/InputFiles';

export const Home: React.FC = () => {

    return (
        <div>
            <h1>Welcome!</h1>
            <InputFiles></InputFiles>
        </div>
    );
};