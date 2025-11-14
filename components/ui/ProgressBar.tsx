
import React from 'react';

interface ProgressBarProps {
    value: number;
    max: number;
    className?: string;
    colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, className = '', colorClass = 'bg-indigo-600' }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;

    return (
        <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 ${className}`}>
            <div
                className={`${colorClass} h-2.5 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};
