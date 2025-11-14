import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ShieldAlert, Check, X } from 'lucide-react';

const ImpulseBlockModal: React.FC = () => {
    const { state, dispatch } = useApp();
    const { isImpulseBlockModalOpen, blockedTransactionReview } = state;

    const handleClose = () => {
        dispatch({ type: 'CLOSE_IMPULSE_BLOCK_MODAL' });
    };

    const handleConfirm = () => {
        if (blockedTransactionReview) {
            dispatch({ type: 'PROCESS_IMPULSE_BLOCK', payload: { blockId: blockedTransactionReview.id, action: 'confirm' } });
            dispatch({ type: 'SHOW_TOAST', payload: 'Gasto confirmado e adicionado!' });
        }
        handleClose();
    };

    const handleCancel = () => {
        if (blockedTransactionReview) {
            dispatch({ type: 'PROCESS_IMPULSE_BLOCK', payload: { blockId: blockedTransactionReview.id, action: 'delete' } });
            dispatch({ type: 'SHOW_TOAST', payload: 'Gasto cancelado.' });
        }
        handleClose();
    };

    if (!isImpulseBlockModalOpen || !blockedTransactionReview) return null;

    return (
        <Modal
            isOpen={isImpulseBlockModalOpen}
            onClose={handleClose}
            title="Bloqueio Anti-Impulso Ativado"
        >
            <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold">Gasto Impulsivo Detectado!</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                    "{blockedTransactionReview.message}"
                </p>

                <div className="flex justify-center gap-4 mt-6">
                    <Button variant="secondary" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar Gasto
                    </Button>
                    <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700 focus:ring-green-500">
                        <Check className="w-4 h-4 mr-2" />
                        Confirmar Gasto
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ImpulseBlockModal;