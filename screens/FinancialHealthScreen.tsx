import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Gem, Lock, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Custom hook for all financial health calculations
const useFinancialHealth = () => {
    const { state } = useApp();
    const { transactions, goals } = state;

    const { score, rating, color, totalIncome, totalExpense } = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        // Score based on savings rate (60% weight)
        const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
        const savingsScore = Math.max(0, Math.min(100, (savingsRate + 10) * 2.5)); // Scale from -10% to 30% savings rate

        // Score based on goal progress (40% weight)
        const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
        const totalGoalProgress = goals.reduce((sum, g) => sum + g.currentAmount, 0);
        const goalProgressPercentage = totalGoalTarget > 0 ? (totalGoalProgress / totalGoalTarget) * 100 : 100;
        const goalScore = Math.max(0, Math.min(100, goalProgressPercentage));
        
        const finalScore = Math.round((savingsScore * 0.6) + (goalScore * 0.4));
        
        let finalRating = "Ruim";
        let finalColor = "text-red-500";
        if (finalScore >= 90) { finalRating = "Excelente"; finalColor = "text-blue-500"; }
        else if (finalScore >= 70) { finalRating = "Boa"; finalColor = "text-green-500"; }
        else if (finalScore >= 40) { finalRating = "Regular"; finalColor = "text-yellow-500"; }

        return { score: finalScore, rating: finalRating, color: finalColor, totalIncome: income, totalExpense: expense };
    }, [transactions, goals]);

    const keyIndicators = {
        balance: totalIncome - totalExpense,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
        activeGoals: goals.length,
        goalsProgress: goals.reduce((sum, g) => sum + g.currentAmount, 0) / goals.reduce((sum, g) => sum + g.targetAmount, 1) * 100,
    };
    
    return { score, rating, color, keyIndicators };
};

const FinancialHealthScreen: React.FC = () => {
    const { state, dispatch } = useApp();
    const { subscriptionPlan } = state;
    const { score, rating, color, keyIndicators } = useFinancialHealth();

    const pieData = [{ name: 'Score', value: score }, { name: 'Remaining', value: 100 - score }];
    const scoreColor = color.replace('text-', '').replace('-500', '');

    const historyData = [
        { name: '3 meses atrás', Pontuação: 65 },
        { name: '2 meses atrás', Pontuação: 72 },
        { name: 'Mês passado', Pontuação: 75 },
        { name: 'Este mês', Pontuação: score },
    ];
    
    if (subscriptionPlan === 'free') {
        return (
            <div className="pb-16 md:pb-0">
                <Header title="Saúde Financeira" />
                <Card className="flex flex-col items-center justify-center text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50">
                    <Lock size={48} className="mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Receba um diagnóstico completo da sua vida financeira</h3>
                    <p className="max-w-md mt-2 text-sm text-gray-600 dark:text-gray-300">
                        Nossa IA analisa seus hábitos, calcula sua pontuação de saúde financeira e cria um plano de ação para você melhorar.
                    </p>
                    <Button onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'subscription' })} className="mt-6">
                        <Gem className="w-4 h-4 mr-2" />
                        Desbloquear com o Premium
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-16 md:pb-0">
            <Header title="Saúde Financeira" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-semibold mb-4">Sua Pontuação</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                startAngle={90}
                                endAngle={-270}
                                paddingAngle={0}
                                dataKey="value"
                            >
                                <Cell key="score" fill={`var(--color-${scoreColor}-500)`} className="stroke-none" />
                                <Cell key="remaining" fill="var(--color-gray-200)" className="dark:fill-gray-700 stroke-none" />
                            </Pie>
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className={`text-5xl font-bold fill-current ${color}`}>{score}</text>
                        </PieChart>
                    </ResponsiveContainer>
                    <p className={`text-xl font-bold ${color}`}>{rating}</p>
                    <p className="text-xs text-gray-500 mt-1">Atualizado hoje</p>
                </Card>

                <Card className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Análise Inteligente</h3>
                    <div className="space-y-3">
                        <div className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <CheckCircle size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-sm">Bom Equilíbrio Financeiro</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-300">Suas receitas superaram suas despesas, resultando em um saldo positivo. Ótimo trabalho!</p>
                            </div>
                        </div>
                         <div className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            {keyIndicators.savingsRate > 15 ? <TrendingUp size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" /> : <TrendingDown size={20} className="text-yellow-500 mr-3 mt-1 flex-shrink-0" />}
                            <div>
                                <h4 className="font-semibold text-sm">Taxa de Poupança</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-300">Você está economizando {keyIndicators.savingsRate.toFixed(1)}% da sua renda. {keyIndicators.savingsRate > 15 ? 'Excelente!' : 'Pode melhorar.'}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
            
             <Card>
                <h3 className="text-lg font-semibold mb-4">Histórico da Pontuação</h3>
                <ResponsiveContainer width="100%" height={250}>
                     <LineChart data={historyData}>
                        <XAxis dataKey="name" stroke="var(--color-gray-500)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--color-gray-500)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-gray-800)', border: 'none', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Line type="monotone" dataKey="Pontuação" stroke={`var(--color-${scoreColor}-500)`} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
             </Card>

        </div>
    );
};

export default FinancialHealthScreen;
