import React from 'react';
import { Logo } from '../ui/Logo';

export const MobileHeader: React.FC = () => {
    return (
        <header className="md:hidden flex items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="w-32">
                 <Logo />
            </div>
        </header>
    );
};
