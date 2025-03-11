import React from 'react';

export const PageNotFound: React.FC = () => {
    return (
        <div className="flex items-center justify-center flex-col gap-8">
            <h1>404 - Page Not Found</h1>
            <p>Sorry, the page you are looking for does not exist.</p>
        </div>
    );
};
