import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Screen } from '../../types';
import { Logo } from '../ui/Logo';
import { X, LayoutDashboard, History, Folder, Target, Trophy, LineChart, HeartPulse, BrainCircuit, Gem, LogOut, Users, CalendarClock, ShieldAlert, ShieldBan } from 'lucide-react';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    screen: Screen;
    isPremium?: boolean;
    badgeCount?: number;
}

const MobileMenuDrawer: React.FC = () => {
    const { state, dispatch } = useApp();
    const { isMobileMenuOpen, currentScreen, subscriptionPlan, userName, suspiciousTransactions, impulseBlocks } = state;

    if (!isMobileMenuOpen) {
        return null;
    }

    const handleClose = () => {
        dispatch({ type: 'CLOSE_MOBILE_MENU' });
    };

    const handleNav = (screen: Screen) => {
        dispatch({ type: 'SET_SCREEN', payload: screen });
        handleClose();
    };
    
    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        handleClose();
    };

    const pendingSuspiciousCount = suspiciousTransactions.filter(t => t.status === 'pending').length;
    const pendingImpulseBlockCount = impulseBlocks.filter(b => b.status === 'pending').length;

    const navItems: NavItemProps[] = [
        { icon: LayoutDashboard, label: 'Dashboard', screen: 'dashboard' },
        { icon: History, label: 'Histórico', screen: 'history' },
        { icon: Folder, label: 'Categorias', screen: 'categories' },
        { icon: Target, label: 'Metas', screen: 'goals' },
        { icon: Trophy, label: 'Desafios', screen: 'challenges' },
        { icon: LineChart, label: 'Desempenho', screen: 'performance' , isPremium: true},
        { icon: HeartPulse, label: 'Saúde Financeira', screen: 'financial_health', isPremium: true },
        { icon: BrainCircuit, label: 'Consultor IA', screen: 'ai_advisor', isPremium: true },
        { icon: ShieldAlert, label: 'Transações Suspeitas', screen: 'suspicious_transactions', isPremium: true, badgeCount: pendingSuspiciousCount },
        { icon: ShieldBan, label: 'Modo Anti-Impulso', screen: 'impulse_blocks', isPremium: true, badgeCount: pendingImpulseBlockCount },
        { icon: CalendarClock, label: 'Pagamentos Auto.', screen: 'scheduled_payments', isPremium: true },
        { icon: Users, label: 'Conta Compartilhada', screen: 'shared_account', isPremium: true },
    ];
    
    const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, screen, isPremium = false, badgeCount = 0 }) => {
        const isActive = currentScreen === screen;
        const isPremiumUser = subscriptionPlan === 'premium';

        const handleClick = () => {
            if (isPremium && !isPremiumUser) {
                dispatch({ type: 'OPEN_PREMIUM_UPSELL_MODAL' });
                handleClose();
            } else {
                handleNav(screen);
            }
        };
        
        return (
            <button
                onClick={handleClick}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 relative ${
                    isActive
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
                <Icon size={20} className="mr-3" />
                <span className="flex-1 text-left">{label}</span>
                {isPremium && !isPremiumUser && <Gem size={14} className="text-yellow-400" />}
                {badgeCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {badgeCount}
                    </span>
                )}
            </button>
        );
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 md:hidden animate-fade-in" onClick={handleClose}>
            <div
                className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-800 shadow-xl flex flex-col p-4 transform transition-transform duration-300 ease-in-out animate-slide-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <Logo />
                    <button onClick={handleClose} className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X size={24} />
                    </button>
                </div>
                
                <nav className="flex-1 space-y-2 overflow-y-auto">
                    {navItems.map(item => <NavItem key={item.screen} {...item} />)}
                </nav>

                <div className="mt-auto">
                     <div
                        onClick={() => { handleNav('subscription'); handleClose(); }}
                        className="w-full flex items-center p-4 text-sm font-medium rounded-lg transition-colors duration-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white cursor-pointer hover:opacity-90 mb-4"
                    >
                        <Gem size={20} className="mr-3" />
                        <span>{subscriptionPlan === 'free' ? 'Seja Premium' : 'Você é Premium!'}</span>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300">
                                {userName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-semibold truncate">{userName}</p>
                            </div>
                            <button onClick={handleLogout} className="ml-auto p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Sair">
                                <LogOut size={18} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
             <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                @keyframes slide-in {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default MobileMenuDrawer;
