import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Goal } from '../../types';

const AddGoalModal: React.FC = () => {
    const { state, dispatch } = useApp();
    const { isGoalModalOpen } = state;

    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');

    useEffect(() => {
        if (isGoalModalOpen) {
            // Reset form when modal opens
            setName('');
            setTargetAmount('');
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            setDeadline(nextYear.toISOString().split('T')[0]);
        }
    }, [isGoalModalOpen]);
    
    const handleClose = () => {
        dispatch({ type: 'CLOSE_GOAL_MODAL' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(targetAmount);
        if (!numericAmount || numericAmount <= 0 || !name.trim() || !deadline) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        const newGoal: Goal = {
            id: crypto.randomUUID(),
            name: name.trim(),
            targetAmount: numericAmount,
            currentAmount: 0,
            deadline,
        };

        dispatch({ type: 'ADD_GOAL', payload: newGoal });
        handleClose();
    };

    if (!isGoalModalOpen) return null;

    return (
        <Modal isOpen={isGoalModalOpen} onClose={handleClose} title="Criar Nova Meta Financeira">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="goal-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Meta</label>
                    <input
                        type="text"
                        id="goal-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Ex: Viagem para a Europa"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="goal-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor Alvo (R$)</label>
                    <input
                        type="number"
                        id="goal-amount"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="2000,00"
                        step="0.01"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="goal-deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prazo Final</label>
                    <input
                        type="date"
                        id="goal-deadline"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button type="submit">Criar Meta</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddGoalModal;
