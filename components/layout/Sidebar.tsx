import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Screen } from '../../types';
import { LayoutDashboard, History, Folder, Target, Trophy, LineChart, HeartPulse, BrainCircuit, Gem, LogOut, Users, CalendarClock, ShieldAlert, ShieldBan } from 'lucide-react';
import { Logo } from '../ui/Logo';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    screen: Screen;
    isPremium?: boolean;
    badgeCount?: number;
}

export const Sidebar: React.FC = () => {
    const { state, dispatch } = useApp();
    const { currentScreen, subscriptionPlan, userName, suspiciousTransactions, impulseBlocks } = state;

    const handleNav = (screen: Screen) => {
        dispatch({ type: 'SET_SCREEN', payload: screen });
    };
    
    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
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
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
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
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
            <div className="px-2 mb-8">
                <Logo />
            </div>
            
            <nav className="flex-1 space-y-2">
                {navItems.map(item => <NavItem key={item.screen} {...item} />)}
            </nav>

            <div className="mt-auto">
                 <div
                    onClick={() => handleNav('subscription')}
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
                        <div className="ml-3">
                            <p className="text-sm font-semibold">{userName}</p>
                        </div>
                        <button onClick={handleLogout} className="ml-auto p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Sair">
                            <LogOut size={18} className="text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};