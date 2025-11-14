
import React, { useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Transaction, TransactionType } from '../types';
import { ArrowDownLeft, ArrowUpRight, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const { state } = useApp();
    const category = state.categories.find(c => c.id === transaction.categoryId);
    const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

    return (
        <div className="flex items-center justify-between p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
            <div className="flex items-center">
                <span className="text-2xl mr-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full">{category?.icon || '💸'}</span>
                <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} | {category?.name || 'Sem categoria'}
                    </p>
                </div>
            </div>
            <div className={`flex items-center font-bold text-base ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                {transaction.type === 'income' ? <ArrowUpRight size={18} className="mr-1"/> : <ArrowDownLeft size={18} className="mr-1" />}
                {formatCurrency(transaction.amount)}
            </div>
        </div>
    );
};


const HistoryScreen: React.FC = () => {
    const { state } = useApp();
    const [filter, setFilter] = useState<'all' | TransactionType>('all');

    const filteredTransactions = useMemo(() => {
        if (filter === 'all') {
            return state.transactions;
        }
        return state.transactions.filter(t => t.type === filter);
    }, [state.transactions, filter]);

    return (
        <div className="pb-16 md:pb-0">
            <Header title="Histórico de Transações" />
            
            <Card>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h3 className="text-lg font-semibold">Todas as Transações</h3>
                     <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-500" />
                        <Button variant={filter === 'all' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>Tudo</Button>
                        <Button variant={filter === 'income' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('income')}>Receitas</Button>
                        <Button variant={filter === 'expense' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('expense')}>Despesas</Button>
                    </div>
                </div>
                 <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map(t => <TransactionItem key={t.id} transaction={t} />)
                    ) : (
                        <p className="text-center text-gray-500 py-10">Nenhuma transação encontrada para este filtro.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default HistoryScreen;
