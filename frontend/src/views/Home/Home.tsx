// import HomeStyle from './home.module.scss'

import React from 'react'
import { InputFiles } from '../../components/InputFiles';

export const Home: React.FC = () => {

    return (
        <div className="flex flex-col gap-10">
            <h1>Welcome!</h1>
            <InputFiles></InputFiles>
        </div>
    );
};