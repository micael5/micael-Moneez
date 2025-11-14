import React from 'react';

export const Logo: React.FC = () => {
    return (
        <svg width="150" height="40" viewBox="0 0 150 40" className="text-indigo-600 dark:text-indigo-400">
            {/* Icon */}
            <g>
                <path 
                    d="M 2 34 L 12 16 L 22 28 L 32 11" 
                    stroke="#00C853" // Green
                    strokeWidth="3" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="graph-line"
                />
                <circle cx="32" cy="11" r="3.5" fill="#6C63FF" /> {/* Purple */}
            </g>
            {/* Text */}
            <text 
                x="42" 
                y="30" 
                fontFamily="Inter, sans-serif" 
                fontSize="24" 
                fontWeight="800"
                fill="currentColor"
            >
                MONEEZ
            </text>
        </svg>
    );
};