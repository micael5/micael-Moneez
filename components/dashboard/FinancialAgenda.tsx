

import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, Calendar, Check, Clock, AlertTriangle, BarChart2, TrendingUp, TrendingDown, Target, BrainCircuit } from 'lucide-react';
import { Bill } from '../../types';
import { syncBillToCalendar } from '../../services/calendarService';

const BillItem: React.FC<{ bill: Bill }> = ({ bill }) => {
    const { dispatch, state } = useApp();
    const isOverdue = new Date(bill.dueDate) < new Date() && bill.status === 'pending';
    const isPaid = bill.status === 'paid';
    const isPremium = state.subscriptionPlan === 'premium';
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleMarkAsPaid = () => {
        dispatch({ type: 'UPDATE_BILL_STATUS', payload: { id: bill.id, status: 'paid' } });
        dispatch({
            type: 'ADD_TRANSACTION',
            payload: {
                id: crypto.randomUUID(),
                type: 'expense',
                amount: bill.amount,
                description: `Pagamento: ${bill.name}`,
                categoryId: bill.categoryId || '8',
                date: new Date().toISOString().split('T')[0],
            },
        });
    };

    const handleSyncCalendar = () => {
        syncBillToCalendar(bill);
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 2000);
    };
    
    const getStatusInfo = () => {
        if (isPaid) return { text: 'Pago', icon: <Check size={16} className="text-green-500" />, color: 'text-green-500' };
        if (isOverdue) return { text: 'Vencido', icon: <AlertTriangle size={16} className="text-red-500" />, color: 'text-red-500' };
        return { text: 'Pendente', icon: <Clock size={16} className="text-yellow-500" />, color: 'text-yellow-500' };
    };

    const status = getStatusInfo();
    const formattedDate = new Date(bill.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' });
    const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

    return (
        <div className={`flex items-center p-3 transition-colors rounded-lg ${isPaid ? 'opacity-60' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
            <div className={`mr-3 text-center w-12 flex-shrink-0 p-1 rounded-md ${isOverdue ? 'bg-red-100 dark:bg-red-900/50' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <p className={`font-bold text-sm ${isOverdue ? 'text-red-600 dark:text-red-300' : ''}`}>{formattedDate.split(' ')[0]}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">{formattedDate.split(' ')[2]}</p>
            </div>
            <div className="flex-grow overflow-hidden">
                <p className="font-medium truncate">{bill.name}</p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    {status.icon}
                    <span className={`ml-1.5 font-semibold ${status.color}`}>{status.text}</span>
                </div>
            </div>
            <div className="flex items-center ml-2 flex-shrink-0">
                <p className="font-semibold text-sm mr-4">{formatCurrency(bill.amount)}</p>
                {!isPaid && <Button size="sm" variant="primary" onClick={handleMarkAsPaid}>Pagar</Button>}
                {isPremium && !isPaid && (
                     <button onClick={handleSyncCalendar} className="ml-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 relative" aria-label="Adicionar ao Calendário">
                        {showConfirmation ? <Check size={16} className="text-green-500" /> : <Calendar size={16} className="text-gray-500" />}
                    </button>
                )}
            </div>
        </div>
    );
};


const SimpleBarChart: React.FC<{ data: { day: string; income: number; expense: number }[] }> = ({ data }) => {
    const width = 500;
    const height = 150;
    const margin = { top: 10, right: 5, bottom: 20, left: 35 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const yMax = Math.max(10, ...data.map(d => d.income), ...data.map(d => d.expense));
    const xScale = data.length > 0 ? chartWidth / data.length : 0;
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="text-xs text-gray-500 dark:text-gray-400">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-labelledby="chart-title" role="img">
                <title id="chart-title">Gráfico de Fluxo Financeiro</title>
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    <line x1="0" y1="0" x2="0" y2={chartHeight} stroke="currentColor" strokeOpacity="0.2" />
                    <text x={-5} y={10} textAnchor="end" className="fill-current text-[10px]">{formatCurrency(yMax)}</text>
                    <text x={-5} y={chartHeight} textAnchor="end" className="fill-current text-[10px]">{formatCurrency(0)}</text>
                    <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="currentColor" strokeOpacity="0.2" />
                    
                    {data.map((d, i) => {
                        const x = i * xScale;
                        const incomeHeight = yMax > 0 ? (d.income / yMax) * chartHeight : 0;
                        const expenseHeight = yMax > 0 ? (d.expense / yMax) * chartHeight : 0;

                        return (
                            <g key={i}>
                                <rect x={x + xScale * 0.1} y={chartHeight - incomeHeight} width={xScale * 0.35} height={incomeHeight} className="fill-green-500"><title>Dia: {d.day}\nReceita: {formatCurrency(d.income)}</title></rect>
                                <rect x={x + xScale * 0.55} y={chartHeight - expenseHeight} width={xScale * 0.35} height={expenseHeight} className="fill-red-500"><title>Dia: {d.day}\nDespesa: {formatCurrency(d.expense)}</title></rect>
                                {(i % 6 === 0) && (
                                    <text x={x + xScale / 2} y={chartHeight + 15} textAnchor="middle" className="fill-current text-[10px]">{d.day}</text>
                                )}
                            </g>
                        );
                    })}
                </g>
            </svg>
             <div className="flex justify-center items-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500"></div>Receitas</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500"></div>Despesas</div>
            </div>
        </div>
    );
};

const FinancialAgenda: React.FC = () => {
    const { state, dispatch } = useApp();
    const { bills, subscriptionPlan, transactions, minBalanceGoal } = state;
    
    const isPremium = subscriptionPlan === 'premium';
    
    const upcomingBills = bills.filter(b => b.status !== 'paid').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 3);
    const hasBills = upcomingBills.length > 0;

    const [goalInput, setGoalInput] = useState(String(minBalanceGoal || ''));

    const handleSetGoal = () => {
        const value = parseFloat(goalInput);
        if (!isNaN(value) && value >= 0) {
            dispatch({ type: 'SET_MIN_BALANCE_GOAL', payload: value });
        }
    };

    const { forecast, chartData } = useMemo(() => {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 30);

        const incomeTransactions = transactions.filter(t => t.type === 'income' && (t.description.toLowerCase().includes('salário') || t.description.toLowerCase().includes('renda')));
        const lastIncome = incomeTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        const expectedIncome = lastIncome ? lastIncome.amount : 0;

        const pendingBills = bills.filter(b => b.status === 'pending' && new Date(b.dueDate) <= futureDate);
        const expectedExpenses = pendingBills.reduce((sum, b) => sum + b.amount, 0);

        const currentBalance = transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
        const estimatedBalance = currentBalance + expectedIncome - expectedExpenses;

        const riskLevel = estimatedBalance < 0 ? 'critical' : estimatedBalance < minBalanceGoal ? 'warning' : 'balanced';

        let chartDataPoints = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dailyIncome = (lastIncome && new Date(lastIncome.date).getDate() === date.getDate()) ? expectedIncome : 0;
            const dailyExpense = bills.filter(b => b.dueDate === dateStr && b.status === 'pending').reduce((sum, b) => sum + b.amount, 0);

            chartDataPoints.push({
                day: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                income: dailyIncome,
                expense: dailyExpense,
            });
        }

        return {
            forecast: { expectedIncome, expectedExpenses, estimatedBalance, riskLevel },
            chartData: chartDataPoints,
        };
    }, [bills, transactions, minBalanceGoal]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

    return (
        <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Agenda Financeira</h3>
                <Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'OPEN_BILL_MODAL' })}>
                    <Plus size={14} className="mr-1" />
                    Adicionar
                </Button>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 -m-3">
                {hasBills ? upcomingBills.map(bill => <BillItem key={bill.id} bill={bill} />) : <p className="text-center text-gray-500 py-10 px-3">Nenhuma conta pendente. Tudo em dia! 🎉</p>}
            </div>

            {isPremium && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">🔮 Previsão e Planejamento Inteligente</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><p className="text-xs text-gray-500">Receitas Esperadas</p><p className="font-bold text-green-500">{formatCurrency(forecast.expectedIncome)}</p></div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><p className="text-xs text-gray-500">Contas a Pagar</p><p className="font-bold text-red-500">{formatCurrency(forecast.expectedExpenses)}</p></div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><p className="text-xs text-gray-500">Saldo Estimado</p><p className="font-bold">{formatCurrency(forecast.estimatedBalance)}</p></div>
                    </div>
                    
                     <div className="mb-6"><SimpleBarChart data={chartData} /></div>
                    
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg space-y-4">
                        <div className="flex items-center">
                            <Target size={20} className="text-indigo-500 mr-3" />
                            <div>
                                <h4 className="font-semibold text-sm">Planejamento Inteligente</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-300">Defina sua meta de saldo mínimo para o mês.</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                            <input type="number" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} placeholder="Ex: 500" className="block w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500"/>
                            <Button onClick={handleSetGoal} className="flex-shrink-0">Salvar Meta</Button>
                        </div>
                    </div>

                    <div className="mt-4">
                        {forecast.riskLevel === 'critical' && <div className="flex items-start text-xs p-3 rounded-lg bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200"><AlertTriangle size={24} className="mr-2" /><span><strong className="font-semibold">Alerta Crítico:</strong> Seu saldo pode ficar negativo no próximo mês. Revise seus gastos com urgência para evitar problemas.</span></div>}
                        {forecast.riskLevel === 'warning' && <div className="flex items-start text-xs p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-200"><AlertTriangle size={24} className="mr-2" /><span><strong className="font-semibold">Alerta de Atenção:</strong> Seus gastos estão próximos de superar suas receitas. Você pode não atingir sua meta de saldo mínimo.</span></div>}
                        {forecast.riskLevel === 'balanced' && <div className="flex items-start text-xs p-3 rounded-lg bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-200"><Check size={24} className="mr-2" /><span><strong className="font-semibold">Parabéns:</strong> Suas finanças estão equilibradas para o próximo mês. Você está no caminho certo para atingir seus objetivos!</span></div>}
                    </div>

                </div>
            )}
        </Card>
    );
};

export default FinancialAgenda;