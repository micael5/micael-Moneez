import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Screen } from '../../types';
import { LayoutDashboard, History, Plus, BrainCircuit, Menu, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface NavItemProps {
    icon: React.ElementType;
    screen: Screen;
    label: string;
}

export const MobileNav: React.FC = () => {
    const { state, dispatch } = useApp();
    const { currentScreen, subscriptionPlan } = state;
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsAddMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNav = (screen: Screen) => {
        dispatch({ type: 'SET_SCREEN', payload: screen });
    };
    
    const handleAiClick = () => {
        if(subscriptionPlan === 'premium') {
            handleNav('ai_advisor');
        } else {
            dispatch({ type: 'OPEN_PREMIUM_UPSELL_MODAL' });
        }
    };

    const navItems: NavItemProps[] = [
        { icon: LayoutDashboard, screen: 'dashboard', label: 'Dashboard' },
        { icon: History, screen: 'history', label: 'Histórico' },
    ];

    const NavButton: React.FC<NavItemProps> = ({ icon: Icon, screen, label }) => {
        const isActive = currentScreen === screen;
        return (
            <button
                onClick={() => handleNav(screen)}
                className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
                    isActive ? 'text-indigo-600' : 'text-gray-500'
                }`}
            >
                <Icon size={24} />
                <span className="text-xs mt-1">{label}</span>
            </button>
        );
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-white z-40 border-t border-gray-200">
            <div className="flex justify-around items-center h-16">
                {navItems.map(item => <NavButton key={item.screen} {...item} />)}

                <div className="relative" ref={menuRef}>
                     {isAddMenuOpen && (
                        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-48 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg z-20 animate-fade-in-up">
                            <button
                                onClick={() => {
                                    dispatch({ type: 'OPEN_TRANSACTION_MODAL', payload: { type: 'income' } });
                                    setIsAddMenuOpen(false);
                                }}
                                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg"
                            >
                                <ArrowUpRight size={16} className="mr-2 text-green-500" />
                                Adicionar Receita
                            </button>
                            <div className="border-t border-gray-200 dark:border-gray-600"></div>
                            <button
                                onClick={() => {
                                    dispatch({ type: 'OPEN_TRANSACTION_MODAL', payload: { type: 'expense' } });
                                    setIsAddMenuOpen(false);
                                }}
                                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-b-lg"
                            >
                                <ArrowDownLeft size={16} className="mr-2 text-red-500" />
                                Adicionar Despesa
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setIsAddMenuOpen(prev => !prev)}
                        className="relative -top-4 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110"
                        aria-label="Adicionar transação"
                    >
                        <Plus size={28} />
                    </button>
                </div>
                
                <button
                    onClick={handleAiClick}
                    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
                        currentScreen === 'ai_advisor' ? 'text-indigo-600' : 'text-gray-500'
                    }`}
                >
                    <BrainCircuit size={24} />
                    <span className="text-xs mt-1">Consultor IA</span>
                </button>
                 <button
                    onClick={() => dispatch({ type: 'OPEN_MOBILE_MENU' })}
                    className="flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 text-gray-500"
                >
                    <Menu size={24} />
                    <span className="text-xs mt-1">Menu</span>
                </button>
            </div>
             <style jsx>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};