
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Gem, Lock } from 'lucide-react';

const PremiumReportsScreen: React.FC = () => {
    const { dispatch } = useApp();

    const handleGoToSubscription = () => {
        dispatch({ type: 'SET_SCREEN', payload: 'subscription' });
    };

    return (
         <div className="pb-16 md:pb-0">
            <Header title="Relatórios Avançados" />
            <Card>
                <div className="flex flex-col items-center justify-center text-center text-gray-500 py-16">
                    <Lock size={48} className="mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold">Esta é uma funcionalidade Premium</h3>
                    <p className="max-w-md mt-1 text-sm">
                        Obtenha análises profundas, previsões e comparações mensais com nossos relatórios avançados, disponíveis apenas no plano Premium.
                    </p>
                    <Button onClick={handleGoToSubscription} className="mt-6">
                        <Gem className="w-4 h-4 mr-2" />
                        Conhecer o Premium
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default PremiumReportsScreen;
