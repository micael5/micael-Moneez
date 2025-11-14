import React from 'react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Trophy, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Challenge } from '../types';
import { ProgressBar } from '../components/ui/ProgressBar';

const ChallengeCard: React.FC<{ challenge: Challenge }> = ({ challenge }) => {
    const progress = Math.round((challenge.currentAmount / challenge.targetAmount) * 100);
    const isCompleted = challenge.status === 'completed';
    const statusColor = isCompleted ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    const statusIcon = isCompleted ? <CheckCircle size={14} /> : <Clock size={14} />;

    const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

    return (
        <Card className={`flex flex-col ${isCompleted ? 'opacity-70' : ''}`}>
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-3xl">{challenge.icon}</span>
                     <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor}`}>
                        {statusIcon}
                        {isCompleted ? 'Concluído' : 'Em Andamento'}
                    </span>
                </div>
                <h3 className="font-bold mt-2">{challenge.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4 h-8">{challenge.description}</p>
                
                <ProgressBar value={challenge.currentAmount} max={challenge.targetAmount} colorClass={isCompleted ? 'bg-green-500' : 'bg-indigo-600'} />
                <div className="flex justify-between items-center text-xs mt-1 text-gray-600 dark:text-gray-300">
                    <span>{formatCurrency(challenge.currentAmount)}</span>
                    <span className="font-semibold">{formatCurrency(challenge.targetAmount)}</span>
                </div>
            </div>
             <Button variant="ghost" size="sm" className="mt-4 w-full" disabled={isCompleted}>
                Adicionar Progresso
            </Button>
        </Card>
    );
};

const ChallengesScreen: React.FC = () => {
    const { state, dispatch } = useApp();
    const { challenges } = state;

    return (
         <div className="pb-16 md:pb-0">
            <Header title="Desafios Financeiros" actions={
                <Button onClick={() => dispatch({ type: 'OPEN_CHALLENGE_MODAL' })}>
                    <Plus size={16} className="mr-2" />
                    Novo Desafio
                </Button>
            } />
            
            {challenges.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map(challenge => <ChallengeCard key={challenge.id} challenge={challenge} />)}
                </div>
            ) : (
                <Card>
                    <div className="flex flex-col items-center justify-center text-center text-gray-500 py-16">
                        <Trophy size={48} className="mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold">Gamifique suas finanças!</h3>
                        <p className="max-w-xs mt-1 text-sm">Crie seu primeiro desafio e comece a economizar de uma forma divertida.</p>
                        <Button className="mt-6" onClick={() => dispatch({ type: 'OPEN_CHALLENGE_MODAL' })}>
                            <Plus size={16} className="mr-2" />
                            Criar Novo Desafio
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ChallengesScreen;