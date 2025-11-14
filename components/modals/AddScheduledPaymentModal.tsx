import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ScheduledPayment, PaymentMethod, Bill } from '../../types';

const AddScheduledPaymentModal: React.FC = () => {
    const { state, dispatch } = useApp();
    const { isScheduledPaymentModalOpen, scheduledPaymentToEdit, categories } = state;

    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [isVariable, setIsVariable] = useState(false);
    const [paymentDay, setPaymentDay] = useState('');
    const [paymentMonth, setPaymentMonth] = useState('all');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('debit');
    const [categoryId, setCategoryId] = useState('');
    const [addToAgenda, setAddToAgenda] = useState(true);

    useEffect(() => {
        if (isScheduledPaymentModalOpen) {
            if (scheduledPaymentToEdit) {
                setName(scheduledPaymentToEdit.name);
                setAmount(String(scheduledPaymentToEdit.amount));
                setIsVariable(scheduledPaymentToEdit.isVariable);
                setPaymentDay(String(scheduledPaymentToEdit.paymentDay));
                setPaymentMonth(String(scheduledPaymentToEdit.paymentMonth || 'all'));
                setPaymentMethod(scheduledPaymentToEdit.paymentMethod);
                setCategoryId(scheduledPaymentToEdit.categoryId);
                setAddToAgenda(true);
            } else {
                setName('');
                setAmount('');
                setIsVariable(false);
                setPaymentDay('15');
                setPaymentMonth('all');
                setPaymentMethod('debit');
                setCategoryId(categories.length > 0 ? categories.find(c => c.name !== 'Salário')?.id || categories[0].id : '');
                setAddToAgenda(true);
            }
        }
    }, [isScheduledPaymentModalOpen, scheduledPaymentToEdit, categories]);

    const handleClose = () => {
        dispatch({ type: 'CLOSE_SCHEDULED_PAYMENT_MODAL' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        const day = parseInt(paymentDay);
        const month = paymentMonth === 'all' ? undefined : parseInt(paymentMonth);

        if (!name.trim() || !categoryId || isNaN(day) || day < 1 || day > 31) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
        if (!isVariable && (isNaN(numericAmount) || numericAmount <= 0)) {
            alert('O valor deve ser um número positivo para pagamentos fixos.');
            return;
        }

        const paymentData = {
            name: name.trim(),
            amount: isVariable ? 0 : numericAmount,
            isVariable,
            paymentDay: day,
            paymentMonth: month,
            paymentMethod,
            categoryId,
            isActive: scheduledPaymentToEdit ? scheduledPaymentToEdit.isActive : true,
        };

        if (addToAgenda) {
            const today = new Date();
            // Prevent time zone issues by working with UTC dates
            const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
            const currentYear = todayUTC.getUTCFullYear();
            const currentMonth = todayUTC.getUTCMonth(); // 0-11
            const currentDay = todayUTC.getUTCDate();

            let dueDateYear = currentYear;
            let dueDateMonth; // 0-11
            let dueDateDay = day;

            if (month) { // Annual payment (month is 1-12)
                dueDateMonth = month - 1;
                if (currentMonth > dueDateMonth || (currentMonth === dueDateMonth && currentDay >= dueDateDay)) {
                    dueDateYear++;
                }
            } else { // Monthly payment
                dueDateMonth = currentMonth;
                if (currentDay >= dueDateDay) {
                    dueDateMonth++;
                }
                if (dueDateMonth > 11) {
                    dueDateMonth = 0;
                    dueDateYear++;
                }
            }
            
            // Create a new Date object in UTC
            const dueDate = new Date(Date.UTC(dueDateYear, dueDateMonth, dueDateDay));

            const newBill: Bill = {
                id: crypto.randomUUID(),
                name: `Pagamento Agendado: ${paymentData.name}`,
                amount: isVariable ? 0 : numericAmount,
                dueDate: dueDate.toISOString().split('T')[0],
                categoryId: paymentData.categoryId,
                status: 'pending',
            };
            dispatch({ type: 'ADD_BILL', payload: newBill });
        }


        if (scheduledPaymentToEdit) {
            dispatch({ type: 'UPDATE_SCHEDULED_PAYMENT', payload: { ...paymentData, id: scheduledPaymentToEdit.id } });
        } else {
            dispatch({ type: 'ADD_SCHEDULED_PAYMENT', payload: { ...paymentData, id: crypto.randomUUID() } });
        }

        handleClose();
    };

    const title = scheduledPaymentToEdit ? 'Editar Pagamento Automático' : 'Agendar Pagamento Automático';

    const months = [
        { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' },
        { value: '3', label: 'Março' }, { value: '4', label: 'Abril' },
        { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
        { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' },
        { value: '9', label: 'Setembro' }, { value: '10', label: 'Outubro' },
        { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' },
    ];

    return (
        <Modal isOpen={isScheduledPaymentModalOpen} onClose={handleClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Conta</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Aluguel" required className="mt-1 block w-full p-2 border rounded-md" />
                </div>
                
                <div className="flex items-center">
                    <input type="checkbox" id="isVariable" checked={isVariable} onChange={(e) => setIsVariable(e.target.checked)} className="h-4 w-4 rounded" />
                    <label htmlFor="isVariable" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">O valor é variável?</label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor (R$)</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1500,00" step="0.01" disabled={isVariable} required={!isVariable} className="mt-1 block w-full p-2 border rounded-md disabled:bg-gray-200 dark:disabled:bg-gray-700" />
                    {isVariable && <p className="text-xs text-gray-500 mt-1">Para contas de valor variável, o sistema criará um lembrete para você preencher o valor todo mês.</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dia do Pagamento</label>
                        <input type="number" value={paymentDay} onChange={(e) => setPaymentDay(e.target.value)} placeholder="1-31" min="1" max="31" required className="mt-1 block w-full p-2 border rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mês</label>
                        <select value={paymentMonth} onChange={(e) => setPaymentMonth(e.target.value)} required className="mt-1 block w-full p-2 border rounded-md bg-white">
                            <option value="all">Todo Mês</option>
                            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Forma de Pagamento</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} required className="mt-1 block w-full p-2 border rounded-md bg-white">
                        <option value="debit">Débito Automático</option>
                        <option value="credit">Cartão de Crédito</option>
                        <option value="boleto">Boleto</option>
                        <option value="pix">Pix</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="mt-1 block w-full p-2 border rounded-md bg-white">
                        <option value="" disabled>Selecione</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center pt-2">
                    <input
                        type="checkbox"
                        id="addToAgenda"
                        checked={addToAgenda}
                        onChange={(e) => setAddToAgenda(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="addToAgenda" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Adicionar à Agenda Financeira
                    </label>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddScheduledPaymentModal;