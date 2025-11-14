import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { AlertTriangle, TrendingUp, Gem, Lock, CheckCircle, Wallet } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { generateSmartBudgetAlert } from '../../services/geminiService';
import { Alert, Transaction } from '../../types';

interface SmartAlertsProps {
    transactions: Transaction[];
}

const AlertMessage: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode, colorClass: string, onClick?: () => void }> = ({ icon, title, children, colorClass, onClick }) => (
     <div
        className={`flex items-start p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 ${colorClass} ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
    >
        <div className="mr-3 mt-1 flex-shrink-0">{icon}</div>
        <div>
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300">{children}</p>
        </div>
    </div>
);

export const SmartAlerts: React.FC<SmartAlertsProps> = ({ transactions }) => {
    const { state, dispatch } = useApp();
    const { subscriptionPlan, monthlyBudget, categories } = state;

    const [budgetInput, setBudgetInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiAlert, setAiAlert] = useState<Alert | null>(null);

    useEffect(() => {
        setBudgetInput(monthlyBudget > 0 ? String(monthlyBudget) : '');
    }, [monthlyBudget]);

    const totalExpense = useMemo(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return transactions
            .filter(t => t.type === 'expense' && new Date(t.date) >= startOfMonth)
            .reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);
    
    const daysLeftInMonth = useMemo(() => {
        const today = new Date();
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return Math.max(0, endOfMonth.getDate() - today.getDate());
    }, []);

    const fetchAlert = useCallback(async () => {
        if (monthlyBudget <= 0) return;
        
        const spentPercentage = (totalExpense / monthlyBudget) * 100;
        
        // Only trigger AI if spending is significant
        if (spentPercentage > 70) {
            setIsLoading(true);
            setAiAlert(null); // Clear previous alert
            try {
                const alertData = await generateSmartBudgetAlert(monthlyBudget, totalExpense, daysLeftInMonth, transactions, categories);
                setAiAlert(alertData);
            } catch(e) {
                console.error("Failed to fetch smart alert:", e);
            } finally {
                setIsLoading(false);
            }
        } else {
            setAiAlert(null); // Clear alert if under threshold
        }
    }, [monthlyBudget, totalExpense, daysLeftInMonth, transactions, categories]);
    
    useEffect(() => {
        const timer = setTimeout(() => {
             fetchAlert();
        }, 1000); // Debounce to avoid rapid calls
        return () => clearTimeout(timer);
    }, [fetchAlert]);


    const handleSetBudget = () => {
        const newBudget = parseFloat(budgetInput);
        if (!isNaN(newBudget) && newBudget > 0) {
            dispatch({ type: 'SET_MONTHLY_BUDGET', payload: newBudget });
        }
    };

    const handleNavigateToHistory = () => {
        dispatch({type: 'SET_SCREEN', payload: 'history'});
    };

    const alertConfig = {
        warning: { icon: <AlertTriangle size={20} className="text-yellow-500" />, color: 'border-yellow-500' },
        critical: { icon: <AlertTriangle size={20} className="text-red-500" />, color: 'border-red-500' },
        success: { icon: <CheckCircle size={20} className="text-green-500" />, color: 'border-green-500' },
        info: { icon: <Wallet size={20} className="text-blue-500" />, color: 'border-blue-500' },
    };

    if (subscriptionPlan === 'free') {
        return (
             <Card>
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mb-3">
                        <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="font-semibold mb-1">Alertas Preditivos de Orçamento</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs">
                        Nossa IA monitora seus gastos e te avisa ANTES de você estourar o orçamento.
                    </p>
                    <Button size="sm" onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'subscription' })}>
                        <Gem size={14} className="mr-2"/>
                        Desbloquear com Premium
                    </Button>
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <h3 className="text-lg font-semibold mb-4">Alertas Inteligentes de Orçamento</h3>
            {monthlyBudget > 0 ? (
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center text-sm mb-1">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Gasto no Mês</span>
                            <span className="font-semibold">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense)} / 
                                <span className="text-gray-500"> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyBudget)}</span>
                            </span>
                        </div>
                        <ProgressBar value={totalExpense} max={monthlyBudget} />
                    </div>
                    {isLoading ? (
                         <div className="flex items-center space-x-2 justify-center p-4">
                            <div className="w-2 h-2 bg-indigo-500/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-indigo-500/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-indigo-500/50 rounded-full animate-bounce"></div>
                            <span className="text-xs text-gray-500">IA analisando seus gastos...</span>
                        </div>
                    ) : aiAlert ? (
                        <AlertMessage 
                            icon={alertConfig[aiAlert.level]?.icon} 
                            title={aiAlert.title} 
                            colorClass={alertConfig[aiAlert.level]?.color}
                            onClick={handleNavigateToHistory}
                        >
                            {aiAlert.message}
                        </AlertMessage>
                    ) : (
                        <AlertMessage icon={<TrendingUp size={20} className="text-green-500" />} title="Tudo sob controle!" colorClass="border-green-500">
                           Seus gastos estão dentro do esperado. Continue com o ótimo trabalho!
                        </AlertMessage>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-sm text-center text-gray-500">Defina um orçamento mensal para receber alertas inteligentes.</p>
                     <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(e.target.value)}
                            placeholder="Ex: 2000"
                            className="block w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <Button onClick={handleSetBudget} className="flex-shrink-0">Definir</Button>
                    </div>
                </div>
            )}
        </Card>
    );
};