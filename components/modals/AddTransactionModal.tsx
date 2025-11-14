import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Transaction, TransactionType } from '../../types';

const AddTransactionModal: React.FC = () => {
    const { state, dispatch } = useApp();
    const { isTransactionModalOpen, transactionModalType, categories, transactionModalDefaultValue } = state;

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        // Reset form when modal opens or type changes
        if (isTransactionModalOpen) {
            setAmount(transactionModalDefaultValue?.amount?.toString() || '');
            setDescription(transactionModalDefaultValue?.description || '');
            setCategoryId(transactionModalDefaultValue?.categoryId || (categories.length > 0 ? categories[0].id : ''));
            setDate(transactionModalDefaultValue?.date || new Date().toISOString().split('T')[0]);
        }
    }, [isTransactionModalOpen, transactionModalType, categories, transactionModalDefaultValue]);
    
    const handleClose = () => {
        dispatch({ type: 'CLOSE_TRANSACTION_MODAL' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0 || !description.trim() || !categoryId) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            amount: numericAmount,
            description: description.trim(),
            categoryId,
            date,
            type: transactionModalType as TransactionType,
        };

        dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
        dispatch({ type: 'SHOW_TOAST', payload: 'Transação adicionada com sucesso!' });
        handleClose();
    };

    if (!isTransactionModalOpen) return null;

    const title = transactionModalType === 'income' ? 'Adicionar Receita' : 'Adicionar Despesa';

    return (
        <Modal isOpen={isTransactionModalOpen} onClose={handleClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor (R$)</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="0,00"
                        step="0.01"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                    <input
                        type="text"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Ex: Salário, Aluguel"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                    <select
                        id="category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    >
                        <option value="" disabled>Selecione uma categoria</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
                    <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddTransactionModal;