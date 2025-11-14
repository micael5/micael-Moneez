import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Category } from '../../types';

const AddCategoryModal: React.FC = () => {
    const { state, dispatch } = useApp();
    const { isCategoryModalOpen } = state;

    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isCategoryModalOpen) {
            setName('');
            setIcon('');
            setError('');
        }
    }, [isCategoryModalOpen]);

    const handleClose = () => {
        dispatch({ type: 'CLOSE_CATEGORY_MODAL' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Simple validation for a single emoji
        const emojiRegex = /^\p{Emoji}$/u;
        if (!emojiRegex.test(icon)) {
            setError('Por favor, insira um único emoji como ícone.');
            return;
        }

        if (!name.trim()) {
            setError('Por favor, insira um nome para a categoria.');
            return;
        }

        const newCategory: Category = {
            id: crypto.randomUUID(),
            name: name.trim(),
            icon,
        };

        dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
        handleClose();
    };

    if (!isCategoryModalOpen) return null;

    return (
        <Modal isOpen={isCategoryModalOpen} onClose={handleClose} title="Criar Nova Categoria">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nome da Categoria
                    </label>
                    <input
                        type="text"
                        id="category-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Ex: Pets"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="category-icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ícone (Emoji)
                    </label>
                    <input
                        type="text"
                        id="category-icon"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Ex: 🐶"
                        maxLength={2} // Emojis can sometimes be 2 characters
                        required
                    />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button type="submit">Criar Categoria</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddCategoryModal;
