
import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 transition-all duration-300 ${className}`}>
            {children}
        </div>
    );
};
