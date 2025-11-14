import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Target } from 'lucide-react';
import { Goal } from '../types';
import { ProgressBar } from '../components/ui/ProgressBar';

const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
    const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);
    const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

    return (
        <Card className="flex flex-col">
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{goal.name}</h3>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                    Vencimento: {new Date(goal.deadline).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </p>
                <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
                <div className="flex justify-between items-center text-xs mt-1 text-gray-600 dark:text-gray-300">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>{formatCurrency(goal.targetAmount)}</span>
                </div>
            </div>
             <Button variant="ghost" size="sm" className="mt-4 w-full">
                Adicionar Valor
            </Button>
        </Card>
    )
}

const GoalsScreen: React.FC = () => {
    const { state, dispatch } = useApp();
    const { goals } = state;

    return (
         <div className="pb-16 md:pb-0">
            <Header title="Metas Financeiras" actions={
                <Button onClick={() => dispatch({ type: 'OPEN_GOAL_MODAL' })}>
                    <Plus size={16} className="mr-2" />
                    Nova Meta
                </Button>
            } />
            
            {goals.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
                </div>
            ) : (
                <Card className="bg-none">
                    <div className="flex flex-col items-center justify-center text-center text-gray-500 py-16">
                        <Target size={48} className="mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold">Nenhuma meta definida ainda</h3>
                        <p className="max-w-xs mt-1 text-sm">Crie sua primeira meta e comece a poupar para seus sonhos!</p>
                         <Button className="mt-6" onClick={() => dispatch({ type: 'OPEN_GOAL_MODAL' })}>
                            <Plus size={16} className="mr-2" />
                            Criar Nova Meta
                        </Button>
                    </div>
                </Card>
            )}

        </div>
    );
};

export default GoalsScreen;