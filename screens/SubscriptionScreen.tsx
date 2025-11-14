import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle, Gem, Star } from 'lucide-react';

const Feature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start">
        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
        <span>{children}</span>
    </li>
);

const SubscriptionScreen: React.FC = () => {
    const { state, dispatch } = useApp();
    const { subscriptionPlan } = state;
    
    const handleSubscribe = () => {
        dispatch({ type: 'SET_SUBSCRIPTION_PLAN', payload: 'premium' });
    };

    const handleDowngrade = () => {
        dispatch({ type: 'SET_SUBSCRIPTION_PLAN', payload: 'free' });
    }

    if (subscriptionPlan === 'premium') {
        return (
            <div className="pb-16 md:pb-0">
                <Header title="Você é Premium!" />
                <div className="max-w-3xl mx-auto">
                    <Card className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold">Obrigado por ser Premium!</h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            Você tem acesso a todas as funcionalidades exclusivas.
                        </p>
                        <Button size="md" variant="secondary" className="mt-6" onClick={handleDowngrade}>
                            Voltar para o plano Free (Teste)
                        </Button>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="pb-16 md:pb-0">
            <Header title="Plano Premium" />
            <div className="max-w-3xl mx-auto">
                <Card className="text-center p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50">
                     <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gem className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Desbloqueie todo o potencial do MONEEZ</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Ganhe acesso a ferramentas exclusivas para turbinar sua jornada financeira.
                    </p>

                    <Card className="mt-8 text-left p-6">
                        <h3 className="font-semibold mb-4">Vantagens do Plano Premium:</h3>
                        <ul className="space-y-3 text-gray-700 dark:text-gray-200">
                            <Feature>Análise de Saúde Financeira com pontuação e dicas</Feature>
                            <Feature>Relatórios detalhados com IA avançada</Feature>
                            <Feature>Criação e acompanhamento de metas ilimitadas</Feature>
                            <Feature>Categorias personalizáveis</Feature>
                            <Feature>Suporte prioritário</Feature>
                        </ul>
                    </Card>

                    <div className="mt-8">
                        <p className="text-3xl font-bold">R$ 19,90<span className="text-base font-normal text-gray-500">/mês</span></p>
                        <Button size="lg" className="mt-4 w-full max-w-xs mx-auto" onClick={handleSubscribe}>
                            Assinar Agora
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SubscriptionScreen;