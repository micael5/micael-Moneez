import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Gem, Lock, FileDown, TrendingUp, TrendingDown, ArrowRight, LineChart } from 'lucide-react';
import { exportToPdf } from '../services/pdfService';
import { Transaction } from '../types';

// A custom, lightweight SVG Line Chart component to avoid external library issues.
const PerformanceChart: React.FC<{ data: { month: string; income: number; expense: number }[] }> = ({ data }) => {
    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const yMax = Math.max(100, ...data.flatMap(d => [d.income, d.expense]));

    const getX = (index: number) => margin.left + (index / (data.length - 1)) * chartWidth;
    const getY = (value: number) => margin.top + chartHeight - (value / yMax) * chartHeight;

    const createPath = (dataKey: 'income' | 'expense') => {
        return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d[dataKey])}`).join(' ');
    };

    if (data.length < 2) {
        return (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
                Dados insuficientes para exibir o gráfico.
            </div>
        );
    }
    
    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-labelledby="chart-title" role="img">
                <title id="chart-title">Gráfico de Desempenho Mensal</title>
                {/* Y Axis */}
                <g className="text-xs text-gray-400 dark:text-gray-500">
                    {[0, 0.25, 0.5, 0.75, 1].map(tick => (
                        <g key={tick} transform={`translate(0, ${getY(tick * yMax)})`}>
                            <line x1={margin.left - 5} x2={width - margin.right} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,3" />
                            <text x={margin.left - 10} dy="0.32em" textAnchor="end" className="fill-current">
                                {(tick * yMax / 1000).toFixed(0)}k
                            </text>
                        </g>
                    ))}
                </g>
                {/* X Axis */}
                <g className="text-xs text-gray-500 dark:text-gray-400">
                     {data.map((d, i) => (
                        <text key={d.month} x={getX(i)} y={height - margin.bottom + 15} textAnchor="middle" className="fill-current">
                            {d.month}
                        </text>
                     ))}
                </g>
                {/* Lines */}
                <path d={createPath('expense')} fill="none" stroke="#ef4444" strokeWidth="2" />
                <path d={createPath('income')} fill="none" stroke="#22c55e" strokeWidth="2" />
            </svg>
             <div className="flex justify-center items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500"></div>Receitas</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500"></div>Despesas</div>
            </div>
        </div>
    );
};

const PerformanceScreen: React.FC = () => {
    const { state, dispatch } = useApp();
    const { subscriptionPlan, transactions, userName } = state;

    const handleGoToSubscription = () => {
        dispatch({ type: 'SET_SCREEN', payload: 'subscription' });
    };

    const handleExport = () => {
        exportToPdf('performance-report', `desempenho_financeiro_${userName}.pdf`);
    };

    const { monthlyData, performance } = useMemo(() => {
        const dataByMonth: Record<string, { income: number; expense: number }> = {};

        transactions.forEach(t => {
            const month = new Date(t.date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' });
            if (!dataByMonth[month]) {
                dataByMonth[month] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') dataByMonth[month].income += t.amount;
            else dataByMonth[month].expense += t.amount;
        });

        const sortedMonths = Object.keys(dataByMonth).sort((a, b) => {
            const [mA, yA] = a.split('/');
            const [mB, yB] = b.split('/');
            const dateA = new Date(`01/${mA}/20${yA}`);
            const dateB = new Date(`01/${mB}/20${yB}`);
            return dateA.getTime() - dateB.getTime();
        }).slice(-6); // Last 6 months

        const chartData = sortedMonths.map(month => ({
            month,
            income: dataByMonth[month].income,
            expense: dataByMonth[month].expense,
        }));
        
        let perfData = { percentage: 0, message: "Adicione mais transações para ver seu desempenho." };
        if (chartData.length >= 2) {
            const last = chartData[chartData.length - 1];
            const secondLast = chartData[chartData.length - 2];
            const lastBalance = last.income - last.expense;
            const secondLastBalance = secondLast.income - secondLast.expense;

            if (secondLastBalance !== 0) {
                const change = ((lastBalance - secondLastBalance) / Math.abs(secondLastBalance)) * 100;
                perfData.percentage = Math.round(change);
                if (change > 0) {
                    perfData.message = `Seu saldo positivo aumentou ${Math.round(change)}% em relação ao mês anterior. Excelente!`;
                } else {
                     perfData.message = `Seu saldo positivo diminuiu ${Math.abs(Math.round(change))}%. Vamos analisar o que aconteceu.`;
                }
            } else if (lastBalance > 0) {
                 perfData.message = `Você saiu do zero e teve um saldo positivo de ${lastBalance.toFixed(2)}! Parabéns!`;
                 perfData.percentage = 100;
            }
        }
        
        return { monthlyData: chartData, performance: perfData };

    }, [transactions]);


    if (subscriptionPlan === 'free') {
        return (
            <div className="pb-16 md:pb-0">
                <Header title="Desempenho Financeiro" />
                <Card className="flex flex-col items-center justify-center text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50">
                    <Lock size={48} className="mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Análises detalhadas de Desempenho</h3>
                    <p className="max-w-md mt-2 text-sm text-gray-600 dark:text-gray-300">
                        Compare seus gastos e receitas ao longo do tempo, analise o desempenho por categoria e exporte relatórios em PDF.
                    </p>
                    <Button onClick={handleGoToSubscription} className="mt-6">
                        <Gem className="w-4 h-4 mr-2" />
                        Desbloquear com o Premium
                    </Button>
                </Card>
            </div>
        );
    }
    
    return (
         <div className="space-y-6 pb-16 md:pb-0">
            <Header title="Desempenho Financeiro" actions={
                <Button variant="secondary" onClick={handleExport}>
                    <FileDown size={16} className="mr-2" />
                    Exportar PDF
                </Button>
            } />
            <div id="performance-report">
                <Card>
                     {monthlyData.length < 2 ? (
                        <div className="flex flex-col items-center justify-center text-center text-gray-500 py-16">
                            <LineChart size={48} className="mb-4 text-gray-400" />
                            <h3 className="text-lg font-semibold">Análise de Desempenho</h3>
                            <p className="max-w-xs mt-1 text-sm">Registre transações por pelo menos dois meses para ver sua evolução aqui.</p>
                        </div>
                     ) : (
                        <div className="space-y-6">
                            <div className={`flex items-center p-4 rounded-lg ${performance.percentage >= 0 ? 'bg-green-50 dark:bg-green-900/40' : 'bg-red-50 dark:bg-red-900/40'}`}>
                                {performance.percentage >= 0 ? <TrendingUp className="w-10 h-10 text-green-500 mr-4" /> : <TrendingDown className="w-10 h-10 text-red-500 mr-4" />}
                                <div>
                                    <h3 className="text-base font-bold">
                                        {performance.percentage > 0 ? `Você está ${performance.percentage}% melhor este mês!` : 'Houve uma queda no desempenho.'}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{performance.message}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-center">Receitas vs Despesas (Últimos 6 Meses)</h3>
                                <PerformanceChart data={monthlyData} />
                            </div>
                        </div>
                     )}
                </Card>
            </div>
        </div>
    );
};

export default PerformanceScreen;