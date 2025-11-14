import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowUpRight, ArrowDownLeft, Plus, ChevronDown } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Transaction } from '../types';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SmartAlerts } from '../components/dashboard/SmartAlerts';
import FinancialAgenda from '../components/dashboard/FinancialAgenda';

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const { state } = useApp();
    const category = state.categories.find(c => c.id === transaction.categoryId);
    const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

    return (
        <div className="flex items-center justify-between p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
            <div className="flex items-center overflow-hidden">
                <span className="text-xl mr-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-full">{category?.icon || '💸'}</span>
                <div className="overflow-hidden">
                    <p className="font-medium truncate">{transaction.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{category?.name || 'Sem categoria'}</p>
                </div>
            </div>
            <div className={`flex-shrink-0 ml-2 font-semibold text-sm ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(transaction.amount)}
            </div>
        </div>
    );
};

const DashboardScreen: React.FC = () => {
    const { state, dispatch } = useApp();
    const { transactions, goals, categories } = state;
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

    const { totalIncome, totalExpense, balance } = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        return { totalIncome: income, totalExpense: expense, balance: income - expense };
    }, [transactions]);

    const spendingByCategory = useMemo(() => {
        const spending = transactions
            .filter(t => t.type === 'expense')
            // FIX: Explicitly typed the accumulator for the `reduce` function to be `Record<string, number>`. This ensures TypeScript correctly infers the `value` property as a number, resolving the arithmetic operation error in the subsequent sort function.
            .reduce<Record<string, number>>((acc, t) => {
                const categoryName = categories.find(c => c.id === t.categoryId)?.name || 'Outros';
                acc[categoryName] = (acc[categoryName] || 0) + t.amount;
                return acc;
            }, {});
        
        return Object.entries(spending).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    }, [transactions, categories]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

    const COLORS = ['#4F46E5', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

    return (
        <div className="space-y-6 pb-16 md:pb-0">
            <Header title="Dashboard" actions={
                <div className="relative" ref={menuRef}>
                    <Button onClick={() => setIsAddMenuOpen(prev => !prev)}>
                        <Plus size={16} className="mr-2" />
                        Nova Transação
                        <ChevronDown size={16} className={`ml-2 transition-transform ${isAddMenuOpen ? 'rotate-180' : ''}`} />
                    </Button>
                    {isAddMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg z-20 animate-fade-in-down">
                            <button
                                onClick={() => {
                                    dispatch({ type: 'OPEN_TRANSACTION_MODAL', payload: { type: 'income' } });
                                    setIsAddMenuOpen(false);
                                }}
                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg"
                            >
                                <ArrowUpRight size={16} className="mr-2 text-green-500" />
                                Receita
                            </button>
                            <button
                                onClick={() => {
                                    dispatch({ type: 'OPEN_TRANSACTION_MODAL', payload: { type: 'expense' } });
                                    setIsAddMenuOpen(false);
                                }}
                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-b-lg"
                            >
                                <ArrowDownLeft size={16} className="mr-2 text-red-500" />
                                Despesa
                            </button>
                        </div>
                    )}
                </div>
            } />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Receitas</p>
                        <p className="text-2xl font-bold text-green-500">{formatCurrency(totalIncome)}</p>
                    </div>
                    <ArrowUpRight className="text-green-500" size={24} />
                </Card>
                <Card className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Despesas</p>
                        <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpense)}</p>
                    </div>
                    <ArrowDownLeft className="text-red-500" size={24} />
                </Card>
                <Card className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Atual</p>
                        <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
                    </div>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Gastos por Categoria</h3>
                    {spendingByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={spendingByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {spendingByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend wrapperStyle={{fontSize: "12px"}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-center text-gray-500 py-10">Nenhuma despesa registrada ainda.</p>}
                </Card>
                 <Card>
                    <h3 className="text-lg font-semibold mb-4">Metas</h3>
                    <div className="space-y-4">
                        {goals.length > 0 ? goals.map(goal => (
                            <div key={goal.id}>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                    <span className="font-medium">{goal.name}</span>
                                    <span className="text-gray-500 dark:text-gray-400">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                                </div>
                                <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
                            </div>
                        )) : <p className="text-center text-gray-500 py-10">Crie metas para começar!</p>}
                    </div>
                </Card>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Transações Recentes</h3>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700 -m-2">
                        {transactions.length > 0 ? (
                            transactions.slice(0, 5).map(t => <TransactionItem key={t.id} transaction={t} />)
                        ) : (
                            <p className="text-center text-gray-500 py-10">Nenhuma transação registrada.</p>
                        )}
                    </div>
                </Card>
                 <SmartAlerts transactions={transactions} />
                 <FinancialAgenda />
            </div>
            <style jsx>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default DashboardScreen;