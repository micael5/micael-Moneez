import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Gem, Lock, Plus, CalendarClock, Edit, Trash2, AlertCircle, Bell, CheckCircle } from 'lucide-react';
import { ScheduledPayment } from '../types';

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
};

const ScheduledPaymentItem: React.FC<{ payment: ScheduledPayment }> = ({ payment }) => {
    const { state, dispatch } = useApp();
    const category = state.categories.find(c => c.id === payment.categoryId);
    const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

    const handleToggle = (isActive: boolean) => {
        dispatch({ type: 'UPDATE_SCHEDULED_PAYMENT', payload: { ...payment, isActive } });
    };

    const handleEdit = () => {
        dispatch({ type: 'OPEN_SCHEDULED_PAYMENT_MODAL', payload: payment });
    };

    const handleDelete = () => {
        if (window.confirm(`Tem certeza que deseja excluir o pagamento agendado "${payment.name}"?`)) {
            dispatch({ type: 'DELETE_SCHEDULED_PAYMENT', payload: { id: payment.id } });
        }
    };
    
    const paymentDateInfo = payment.paymentMonth
        ? `Dia ${payment.paymentDay} de ${new Date(0, payment.paymentMonth - 1).toLocaleString('pt-BR', { month: 'long' })} (Anual)`
        : `Todo dia ${payment.paymentDay} (Mensal)`;

    return (
        <Card className={`p-4 ${!payment.isActive ? 'opacity-50 bg-gray-50 dark:bg-gray-800/50' : ''}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-hidden">
                    <span className="text-3xl bg-gray-100 dark:bg-gray-700 p-2 rounded-lg flex-shrink-0">{category?.icon || '💸'}</span>
                    <div className="overflow-hidden">
                        <p className="font-bold truncate">{payment.name}</p>
                        <p className="text-sm text-gray-500 truncate">
                           {paymentDateInfo} | {payment.isVariable ? 'Valor Variável' : formatCurrency(payment.amount)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <ToggleSwitch checked={payment.isActive} onChange={handleToggle} />
                    <Button variant="ghost" size="sm" className="!p-2" onClick={handleEdit}><Edit size={16} /></Button>
                    <Button variant="ghost" size="sm" className="!p-2 text-red-500" onClick={handleDelete}><Trash2 size={16} /></Button>
                </div>
            </div>
        </Card>
    );
};


const ScheduledPaymentsScreen: React.FC = () => {
    const { state, dispatch } = useApp();
    const { subscriptionPlan, scheduledPayments } = state;

    if (subscriptionPlan === 'free') {
        return (
            <div className="pb-16 md:pb-0">
                <Header title="Pagamentos Automáticos" />
                <Card className="flex flex-col items-center justify-center text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50">
                    <Lock size={48} className="mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold">Nunca mais esqueça uma conta!</h3>
                    <p className="max-w-md mt-2 text-sm text-gray-600 dark:text-gray-300">
                        Agende seus pagamentos recorrentes e deixe o MONEEZ cuidar de tudo para você. Recurso exclusivo do plano Premium.
                    </p>
                    <Button onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'subscription' })} className="mt-6">
                        <Gem className="w-4 h-4 mr-2" /> Desbloquear com o Premium
                    </Button>
                </Card>
            </div>
        );
    }
    
    const today = new Date();
    
    const todayPayments = scheduledPayments.filter(p => {
        if (!p.isActive) return false;
        return p.paymentDay === today.getDate() && (!p.paymentMonth || p.paymentMonth === today.getMonth() + 1);
    });
    
    const upcomingPayments = scheduledPayments.filter(p => {
        if (!p.isActive) return false;
        const todayDate = today.getDate();
        const currentMonth = today.getMonth() + 1;
        
        // Exclude today's payments which are already handled
        if (p.paymentDay === todayDate && (!p.paymentMonth || p.paymentMonth === currentMonth)) {
            return false;
        }

        // Check for next 7 days
        for (let i = 1; i <= 7; i++) {
            const checkDate = new Date();
            checkDate.setDate(today.getDate() + i);
            
            if (p.paymentDay === checkDate.getDate()) {
                if (!p.paymentMonth || p.paymentMonth === checkDate.getMonth() + 1) {
                    return true;
                }
            }
        }
        return false;
    }).sort((a,b) => a.paymentDay - b.paymentDay);


    return (
        <div className="space-y-6 pb-16 md:pb-0">
            <Header title="Pagamentos Automáticos" actions={
                <Button onClick={() => dispatch({ type: 'OPEN_SCHEDULED_PAYMENT_MODAL' })}>
                    <Plus size={16} className="mr-2" /> Agendar Pagamento
                </Button>
            } />
            
            <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Bell size={20} className="text-indigo-500"/> Alertas Inteligentes</h3>
                <div className="space-y-3">
                    {todayPayments.length > 0 && todayPayments.map(p => (
                         <div key={p.id} className="flex items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                            <AlertCircle size={20} className="mr-3"/>
                            <span>Seu pagamento de <strong>{p.name}</strong> será processado hoje.</span>
                        </div>
                    ))}
                     {upcomingPayments.length > 0 && upcomingPayments.map(p => (
                         <div key={p.id} className="flex items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                            <AlertCircle size={20} className="mr-3"/>
                            <span>Pagamento de <strong>{p.name}</strong> agendado para o dia {p.paymentDay}.</span>
                        </div>
                    ))}
                    {todayPayments.length === 0 && upcomingPayments.length === 0 && (
                        <div className="flex items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                            <CheckCircle size={20} className="mr-3"/>
                            <span>Nenhum pagamento programado para os próximos 7 dias.</span>
                        </div>
                    )}
                </div>
            </Card>

            <div className="space-y-4">
                 <h3 className="text-lg font-semibold">Pagamentos Agendados</h3>
                {scheduledPayments.length > 0 ? (
                    <div className="space-y-4">
                        {scheduledPayments.map(p => <ScheduledPaymentItem key={p.id} payment={p} />)}
                    </div>
                ) : (
                    <Card>
                        <div className="text-center py-12 text-gray-500">
                            <CalendarClock size={40} className="mx-auto mb-4" />
                            <h4 className="font-semibold">Nenhum pagamento agendado</h4>
                            <p className="text-sm">Clique em "Agendar Pagamento" para começar.</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ScheduledPaymentsScreen;