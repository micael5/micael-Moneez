import React, { useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldAlert, AlertTriangle, Repeat, Clock, HelpCircle, ShieldCheck, ShieldX, ShieldQuestion } from 'lucide-react';
import { SuspiciousTransaction, SuspiciousTransactionStatus, Transaction } from '../types';

const reasonInfo: Record<SuspiciousTransaction['reason'], { icon: React.ReactNode; title: string }> = {
    unusual_amount: { icon: <AlertTriangle className="text-yellow-500" />, title: 'Gasto Incomum' },
    duplicate: { icon: <Repeat className="text-orange-500" />, title: 'Compra Duplicada' },
    unusual_time: { icon: <Clock className="text-purple-500" />, title: 'Horário Atípico' },
    new_subscription: { icon: <HelpCircle className="text-blue-500" />, title: 'Assinatura Inesperada' },
};

const TransactionDetail: React.FC<{ transaction: Transaction | undefined }> = ({ transaction }) => {
    const { state } = useApp();
    const category = state.categories.find(c => c.id === transaction?.categoryId);
    if (!transaction) return <p className="text-sm text-red-500">Transação original não encontrada.</p>;

    return (
        <div className="flex items-center justify-between p-2 mt-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center">
                <span className="text-xl mr-3">{category?.icon || '💸'}</span>
                <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                </div>
            </div>
            <p className="font-bold text-red-500">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
            </p>
        </div>
    );
};

const SuspiciousTransactionCard: React.FC<{ alert: SuspiciousTransaction }> = ({ alert }) => {
    const { state, dispatch } = useApp();
    const originalTransaction = state.transactions.find(t => t.id === alert.transactionId);

    const handleUpdateStatus = (status: SuspiciousTransactionStatus) => {
        dispatch({ type: 'UPDATE_SUSPICIOUS_TRANSACTION_STATUS', payload: { id: alert.id, status } });
    };

    const handleReview = () => {
        if(originalTransaction) {
            dispatch({ type: 'OPEN_TRANSACTION_MODAL', payload: { type: 'expense', defaultValue: originalTransaction } });
        }
    }

    const info = reasonInfo[alert.reason];

    return (
        <Card>
            <div className="flex items-start">
                <div className="mr-4 mt-1">{info.icon}</div>
                <div className="flex-grow">
                    <h3 className="font-bold">{info.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{alert.message}</p>
                    <TransactionDetail transaction={originalTransaction} />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus('ignored')}>Ignorar</Button>
                        <Button variant="ghost" size="sm" onClick={handleReview}>Revisar</Button>
                        <Button size="sm" onClick={() => handleUpdateStatus('confirmed')}>Confirmar</Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};


const SuspiciousTransactionsScreen: React.FC = () => {
    const { state } = useApp();
    const [filter, setFilter] = useState<SuspiciousTransactionStatus>('pending');
    
    const filteredAlerts = useMemo(() => {
        return state.suspiciousTransactions.filter(t => t.status === filter);
    }, [state.suspiciousTransactions, filter]);

    return (
        <div className="space-y-6 pb-16 md:pb-0">
            <Header title="Transações Suspeitas" />

            <Card className="p-4">
                <div className="flex justify-center gap-2">
                    <Button
                        variant={filter === 'pending' ? 'primary' : 'ghost'}
                        onClick={() => setFilter('pending')}
                    >
                        <ShieldQuestion className="mr-2" size={16} /> Pendentes
                    </Button>
                    <Button
                        variant={filter === 'confirmed' ? 'primary' : 'ghost'}
                        onClick={() => setFilter('confirmed')}
                    >
                        <ShieldCheck className="mr-2" size={16} /> Confirmadas
                    </Button>
                    <Button
                        variant={filter === 'ignored' ? 'primary' : 'ghost'}
                        onClick={() => setFilter('ignored')}
                    >
                        <ShieldX className="mr-2" size={16} /> Ignoradas
                    </Button>
                </div>
            </Card>

            {filteredAlerts.length > 0 ? (
                <div className="space-y-4">
                    {filteredAlerts.map(alert => <SuspiciousTransactionCard key={alert.id} alert={alert} />)}
                </div>
            ) : (
                <Card>
                    <div className="text-center py-16 text-gray-500">
                        <ShieldCheck size={48} className="mx-auto mb-4 text-green-500" />
                        <h3 className="font-semibold text-lg">Tudo certo por aqui!</h3>
                        <p className="text-sm mt-1">Nenhuma transação {filter === 'pending' ? 'pendente de análise' : (filter === 'confirmed' ? 'confirmada' : 'ignorada')} foi encontrada.</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default SuspiciousTransactionsScreen;
