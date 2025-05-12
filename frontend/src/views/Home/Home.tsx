import React from 'react'
import { InputFiles } from '../../components/InputFiles';

export const Home: React.FC = () => {

    return (
        <div className="flex flex-col gap-16">
            <h1>Welcome!</h1>
            <InputFiles></InputFiles>
        </div>
    );
};