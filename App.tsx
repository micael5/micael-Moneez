import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import HistoryScreen from './screens/HistoryScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import GoalsScreen from './screens/GoalsScreen';
import ChallengesScreen from './screens/ChallengesScreen';
import PerformanceScreen from './screens/PerformanceScreen';
import FinancialHealthScreen from './screens/FinancialHealthScreen';
import AiAdvisorScreen from './screens/AiAdvisorScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import SharedAccountScreen from './screens/SharedAccountScreen';
import ScheduledPaymentsScreen from './screens/ScheduledPaymentsScreen';
import SuspiciousTransactionsScreen from './screens/SuspiciousTransactionsScreen';
import ImpulseBlocksScreen from './screens/ImpulseBlocksScreen';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import MobileMenuDrawer from './components/layout/MobileMenuDrawer';
import AddTransactionModal from './components/modals/AddTransactionModal';
import AddBillModal from './components/modals/AddBillModal';
import AddGoalModal from './components/modals/AddGoalModal';
import AddCategoryModal from './components/modals/AddCategoryModal';
import AddChallengeModal from './components/modals/AddChallengeModal';
import AddScheduledPaymentModal from './components/modals/AddScheduledPaymentModal';
import ImpulseBlockModal from './components/modals/ImpulseBlockModal';
import PremiumUpsellModal from './components/ui/PremiumUpsellModal';
import { MobileHeader } from './components/layout/MobileHeader';
import VoiceCommandButton from './components/ui/VoiceCommandButton';
import Toast from './components/ui/Toast';

const AppContent: React.FC = () => {
    const { state } = useApp();
    const { userName, currentScreen } = state;

    if (!userName) {
        return <LoginScreen />;
    }

    const renderScreen = () => {
        switch (currentScreen) {
            case 'dashboard':
                return <DashboardScreen />;
            case 'history':
                return <HistoryScreen />;
            case 'categories':
                return <CategoriesScreen />;
            case 'goals':
                return <GoalsScreen />;
            case 'challenges':
                return <ChallengesScreen />;
            case 'performance':
                return <PerformanceScreen />;
            case 'financial_health':
                return <FinancialHealthScreen />;
            case 'ai_advisor':
                return <AiAdvisorScreen />;
            case 'subscription':
                return <SubscriptionScreen />;
            case 'shared_account':
                return <SharedAccountScreen />;
            case 'scheduled_payments':
                return <ScheduledPaymentsScreen />;
            case 'suspicious_transactions':
                return <SuspiciousTransactionsScreen />;
            case 'impulse_blocks':
                return <ImpulseBlocksScreen />;
            default:
                return <DashboardScreen />;
        }
    };

    return (
        <div className="flex h-screen bg-white dark:bg-white text-gray-900 dark:text-gray-900 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MobileHeader />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {renderScreen()}
                </main>
                <MobileNav />
            </div>
            <VoiceCommandButton />
            <AddTransactionModal />
            <AddBillModal />
            <AddGoalModal />
            <AddCategoryModal />
            <AddChallengeModal />
            <AddScheduledPaymentModal />
            <ImpulseBlockModal />
            <PremiumUpsellModal />
            <Toast />
            <MobileMenuDrawer />
        </div>
    );
};


const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AppProvider>
                <AppContent />
            </AppProvider>
        </ThemeProvider>
    );
};

export default App;