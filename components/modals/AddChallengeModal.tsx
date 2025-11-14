import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Challenge } from '../../types';

const AddChallengeModal: React.FC = () => {
    const { state, dispatch } = useApp();
    const { isChallengeModalOpen } = state;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('💰');
    const [targetAmount, setTargetAmount] = useState('');
    const [durationDays, setDurationDays] = useState('30');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isChallengeModalOpen) {
            setName('');
            setDescription('');
            setIcon('💰');
            setTargetAmount('');
            setDurationDays('30');
            setError('');
        }
    }, [isChallengeModalOpen]);

    const handleClose = () => {
        dispatch({ type: 'CLOSE_CHALLENGE_MODAL' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const numericAmount = parseFloat(targetAmount);
        const numericDuration = parseInt(durationDays, 10);
        const emojiRegex = /^\p{Emoji}$/u;

        if (!name.trim()) {
            setError('O nome do desafio é obrigatório.');
            return;
        }
        if (!emojiRegex.test(icon)) {
            setError('Por favor, insira um único emoji como ícone.');
            return;
        }
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('O valor alvo deve ser um número positivo.');
            return;
        }
        if (isNaN(numericDuration) || numericDuration <= 0) {
            setError('A duração deve ser um número positivo de dias.');
            return;
        }

        const newChallenge: Challenge = {
            id: crypto.randomUUID(),
            name: name.trim(),
            description: description.trim(),
            icon,
            targetAmount: numericAmount,
            currentAmount: 0,
            durationDays: numericDuration,
            startDate: new Date().toISOString(),
            status: 'active',
        };

        dispatch({ type: 'ADD_CHALLENGE', payload: newChallenge });
        handleClose();
    };

    if (!isChallengeModalOpen) return null;

    return (
        <Modal isOpen={isChallengeModalOpen} onClose={handleClose} title="Criar Novo Desafio Financeiro">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="challenge-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nome do Desafio
                    </label>
                    <input
                        type="text"
                        id="challenge-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border rounded-md"
                        placeholder="Ex: Economizar no Almoço"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="challenge-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Descrição (Opcional)
                    </label>
                    <input
                        type="text"
                        id="challenge-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border rounded-md"
                        placeholder="Ex: Levar comida de casa 3x por semana"
                    />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div className="sm:col-span-1">
                        <label htmlFor="challenge-icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ícone</label>
                        <input
                            type="text"
                            id="challenge-icon"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border rounded-md text-center"
                            maxLength={2}
                            required
                        />
                    </div>
                    <div className="sm:col-span-2">
                         <label htmlFor="challenge-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Meta de Economia (R$)
                        </label>
                        <input
                            type="number"
                            id="challenge-amount"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border rounded-md"
                            placeholder="100,00"
                            step="0.01"
                            required
                        />
                    </div>
                </div>
                 <div>
                    <label htmlFor="challenge-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Duração do Desafio (em dias)
                    </label>
                    <input
                        type="number"
                        id="challenge-duration"
                        value={durationDays}
                        onChange={(e) => setDurationDays(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border rounded-md"
                        placeholder="30"
                        step="1"
                        required
                    />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button type="submit">Iniciar Desafio</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddChallengeModal;