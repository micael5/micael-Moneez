import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { Gem, X } from 'lucide-react';

const PremiumUpsellModal: React.FC = () => {
    const { state, dispatch } = useApp();
    const { isPremiumUpsellModalOpen } = state;

    const handleClose = () => {
        dispatch({ type: 'CLOSE_PREMIUM_UPSELL_MODAL' });
    };

    const handleGoToSubscription = () => {
        dispatch({ type: 'SET_SCREEN', payload: 'subscription' });
        handleClose();
    };

    if (!isPremiumUpsellModalOpen) return null;

    return (
        <Modal
            isOpen={isPremiumUpsellModalOpen}
            onClose={handleClose}
            title="Exclusivo para Assinantes Premium"
        >
            <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gem className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold">Funcionalidade Premium</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                    Para acessar esta e outras funcionalidades incríveis, como relatórios avançados e metas ilimitadas, assine nosso plano Premium.
                </p>

                <div className="flex justify-center gap-4 mt-6">
                    <Button variant="secondary" onClick={handleClose}>
                        <X className="w-4 h-4 mr-2" />
                        Agora não
                    </Button>
                    <Button onClick={handleGoToSubscription}>
                        <Gem className="w-4 h-4 mr-2" />
                        Ver Vantagens
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default PremiumUpsellModal;
