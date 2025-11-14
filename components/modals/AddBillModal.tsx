import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Bill } from '../../types';

const AddBillModal: React.FC = () => {
    const { state, dispatch } = useApp();
    const { isBillModalOpen, categories } = state;

    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [categoryId, setCategoryId] = useState('');

    useEffect(() => {
        if (isBillModalOpen) {
            setName('');
            setAmount('');
            setDueDate(new Date().toISOString().split('T')[0]);
            setCategoryId('');
        }
    }, [isBillModalOpen]);
    
    const handleClose = () => {
        dispatch({ type: 'CLOSE_BILL_MODAL' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0 || !name.trim() || !dueDate) {
            alert('Por favor, preencha nome, valor e data de vencimento.');
            return;
        }

        const newBill: Bill = {
            id: crypto.randomUUID(),
            name: name.trim(),
            amount: numericAmount,
            dueDate,
            categoryId: categoryId || undefined,
            status: 'pending',
        };

        dispatch({ type: 'ADD_BILL', payload: newBill });
        handleClose();
    };

    if (!isBillModalOpen) return null;

    return (
        <Modal isOpen={isBillModalOpen} onClose={handleClose} title="Adicionar Conta ou Compromisso">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="bill-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Conta</label>
                    <input
                        type="text"
                        id="bill-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Ex: Conta de Luz"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="bill-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor (R$)</label>
                    <input
                        type="number"
                        id="bill-amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="0,00"
                        step="0.01"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="bill-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria (Opcional)</label>
                    <select
                        id="bill-category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="">Nenhuma</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="bill-duedate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Vencimento</label>
                    <input
                        type="date"
                        id="bill-duedate"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button type="submit">Adicionar Conta</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddBillModal;