import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Mic, X, BrainCircuit, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Card } from './Card';
import { parseVoiceCommand } from '../../services/geminiService';
import { Transaction, Goal, Bill, Screen, ScheduledPayment } from '../../types';

// Type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: ((event: any) => void) | null;
    onresult: ((event: any) => void) | null;
}
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognitionAPI;

type VoiceCommandStatus = 'idle' | 'listening' | 'processing' | 'answered' | 'error';

const VoiceCommandButton: React.FC = () => {
    const { dispatch, state } = useApp();
    const { isPremiumUpsellModalOpen, isTransactionModalOpen, isBillModalOpen, categories, subscriptionPlan, bills, goals, scheduledPayments, isAntiImpulseModeEnabled } = state;
    const isPremium = subscriptionPlan === 'premium';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [status, setStatus] = useState<VoiceCommandStatus>('idle');
    const [lastCommand, setLastCommand] = useState<string>('');
    const [lastResponse, setLastResponse] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const closeModal = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
            recognitionRef.current.stop();
        }
        setIsModalOpen(false);
        setStatus('idle');
        setLastCommand('');
        setLastResponse('');
    }, []);

    const handleAction = useCallback((command: any) => {
        if (!command || !command.acao) return;

        const params = command.parametros || {};
        const premiumScreens: Screen[] = ['performance', 'financial_health', 'ai_advisor', 'shared_account', 'scheduled_payments', 'suspicious_transactions', 'impulse_blocks'];

        // Close modal after a delay for actions that navigate or open other modals
        const closeModalAfterAction = () => setTimeout(closeModal, 500);

        switch (command.acao) {
            case 'abrirTela':
                 if (params.tela) {
                    const screenMap: Record<string, Screen> = {
                        'dashboard': 'dashboard', 'início': 'dashboard', 'home': 'dashboard', 'tela inicial': 'dashboard',
                        'histórico': 'history', 'transações': 'history', 'registros': 'history',
                        'categorias': 'categories', 'setores': 'categories',
                        'metas': 'goals', 'objetivos': 'goals',
                        'desafios': 'challenges',
                        'desempenho': 'performance', 'evolução': 'performance',
                        'saúde financeira': 'financial_health',
                        'consultor ia': 'ai_advisor', 'ajuda': 'ai_advisor',
                        'conta compartilhada': 'shared_account',
                        'pagamentos automáticos': 'scheduled_payments',
                        'transações suspeitas': 'suspicious_transactions',
                        'bloqueios de impulso': 'impulse_blocks', 'gastos bloqueados': 'impulse_blocks'
                    };
                    const screenKey = screenMap[params.tela.toLowerCase()];
                    if (screenKey) {
                        if(premiumScreens.includes(screenKey) && !isPremium) {
                             dispatch({ type: 'OPEN_PREMIUM_UPSELL_MODAL' });
                        } else {
                            dispatch({ type: 'SET_SCREEN', payload: screenKey });
                        }
                    }
                    closeModalAfterAction();
                }
                break;
            case 'criarTransacao': {
                const category = categories.find(c => c.name.toLowerCase() === params.categoria?.toLowerCase()) || categories.find(c => c.name === 'Outros');
                const newTransaction: Transaction = {
                    id: crypto.randomUUID(),
                    type: params.tipo === 'receita' ? 'income' : 'expense',
                    amount: params.valor,
                    description: params.descricao || params.categoria || 'Transação por voz',
                    categoryId: category?.id || '10', // 'Outros'
                    date: new Date().toISOString().split('T')[0],
                };
                dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
                closeModalAfterAction();
                break;
            }
            case 'pagarConta': {
                const billToPay = bills.find(b => b.status === 'pending' && b.name.toLowerCase().includes(params.nome_conta?.toLowerCase()));
                if (billToPay) {
                    dispatch({ type: 'UPDATE_BILL_STATUS', payload: { id: billToPay.id, status: 'paid' } });
                }
                closeModalAfterAction();
                break;
            }
            case 'criarMeta': {
                const newGoal: Goal = {
                    id: crypto.randomUUID(),
                    name: params.nome || 'Nova Meta',
                    targetAmount: params.orcamento,
                    currentAmount: 0,
                    deadline: params.prazo || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                };
                dispatch({ type: 'ADD_GOAL', payload: newGoal });
                dispatch({ type: 'SET_SCREEN', payload: 'goals' });
                closeModalAfterAction();
                break;
            }
            case 'abrirModalAgendamento': {
                if (isPremium) {
                    dispatch({ type: 'OPEN_SCHEDULED_PAYMENT_MODAL' });
                    closeModalAfterAction();
                } else {
                    dispatch({ type: 'OPEN_PREMIUM_UPSELL_MODAL' });
                }
                break;
            }
            case 'alternarPagamento': {
                const paymentToToggle = scheduledPayments.find(p => p.name.toLowerCase().includes(params.nome_conta?.toLowerCase()));
                if (paymentToToggle) {
                    dispatch({ type: 'UPDATE_SCHEDULED_PAYMENT', payload: { ...paymentToToggle, isActive: params.ativar } });
                }
                break;
            }
             case 'removerPagamento': {
                const paymentToDelete = scheduledPayments.find(p => p.name.toLowerCase().includes(params.nome_conta?.toLowerCase()));
                if (paymentToDelete) {
                    dispatch({ type: 'DELETE_SCHEDULED_PAYMENT', payload: { id: paymentToDelete.id } });
                }
                break;
            }
            case 'alternarModoAntiImpulso': {
                if ((params.ativar && !isAntiImpulseModeEnabled) || (!params.ativar && isAntiImpulseModeEnabled)) {
                    dispatch({ type: 'TOGGLE_ANTI_IMPULSE_MODE' });
                }
                break;
            }
            case 'responderUsuario':
                // The response is already set, just keep the modal open to show it.
                break;
            case 'mostrarErro':
                setStatus('error');
                setErrorMessage(command.resposta_para_usuario || 'Ocorreu um erro.');
                break;
            default:
                // Do nothing for unknown actions
                break;
        }
    }, [dispatch, closeModal, isPremium, categories, bills, goals, scheduledPayments, isAntiImpulseModeEnabled]);

    const startListening = useCallback(() => {
        if (!isSpeechRecognitionSupported) {
            setStatus('error');
            setErrorMessage('Seu navegador não suporta reconhecimento de voz.');
            return;
        }

        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
            recognitionRef.current.stop();
        }

        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.lang = 'pt-BR';
        recognitionRef.current.interimResults = false;
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
            setStatus('listening');
        };

        recognitionRef.current.onend = () => {
            if (status === 'listening') {
                 setStatus('idle');
            }
        };
        
        recognitionRef.current.onerror = (event: any) => {
            setStatus('error');
            setErrorMessage(event.error === 'no-speech' ? 'Nenhuma fala detectada.' : 'Erro no reconhecimento de voz.');
        };
        
        recognitionRef.current.onresult = async (event: any) => {
            const commandText = event.results[0][0].transcript;
            setLastCommand(commandText);
            setStatus('processing');
            
            try {
                const command = await parseVoiceCommand(commandText, state);
                setLastResponse(command.resposta_para_usuario);
                setStatus('answered');
                handleAction(command);
            } catch (err) {
                 setStatus('error');
                 setErrorMessage('Não foi possível interpretar o comando.');
            }
        };

        recognitionRef.current.start();

    }, [status, state, handleAction]);

    const openModal = () => {
        if (!isPremium) {
            dispatch({ type: 'OPEN_PREMIUM_UPSELL_MODAL' });
            return;
        }
        setIsModalOpen(true);
        startListening();
    };

    useEffect(() => {
        // Close voice modal if another modal opens on top
        if (isPremiumUpsellModalOpen || isTransactionModalOpen || isBillModalOpen) {
            closeModal();
        }
    }, [isPremiumUpsellModalOpen, isTransactionModalOpen, isBillModalOpen, closeModal]);
    
    const renderStatus = () => {
        switch (status) {
            case 'listening':
                return (
                    <div className="flex flex-col items-center">
                        <p className="font-semibold mb-4">Ouvindo...</p>
                        <div className="flex justify-center items-end h-10 gap-1.5">
                            {[0.5, 0.8, 1, 0.8, 0.5].map((scale, i) => (
                                <div key={i} className="w-2 bg-indigo-500 rounded-full wave-bar" style={{ animationDelay: `${i * 0.1}s`, transform: `scaleY(${scale})` }}></div>
                            ))}
                        </div>
                    </div>
                );
            case 'processing':
                return (
                    <div className="flex flex-col items-center">
                        <p className="font-semibold mb-4">Processando...</p>
                         <Loader2 className="animate-spin text-indigo-500" size={32} />
                         <p className="text-sm text-gray-500 mt-2 italic">"{lastCommand}"</p>
                    </div>
                );
             case 'answered':
                return (
                    <div className="text-center">
                         <p className="text-sm text-gray-500 italic mb-2">Você disse: "{lastCommand}"</p>
                        <Card className="bg-indigo-50 dark:bg-gray-700">
                             <p className="font-semibold text-indigo-800 dark:text-indigo-200">{lastResponse}</p>
                        </Card>
                         <Button onClick={startListening} className="mt-6">Falar novamente</Button>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center">
                         <p className="font-semibold text-red-500 mb-2">Ocorreu um erro</p>
                         <p className="text-gray-600 dark:text-gray-300">{errorMessage}</p>
                         <Button onClick={startListening} className="mt-6">Tentar novamente</Button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <button
                onClick={openModal}
                className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center
                           hover:bg-indigo-700 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Comando de Voz"
            >
                <Mic size={28} />
            </button>
            <Modal isOpen={isModalOpen} onClose={closeModal} title="Moneez Voice IA">
                 <div className="min-h-[150px] flex flex-col justify-center items-center">
                    {renderStatus()}
                 </div>
            </Modal>
        </>
    );
};

export default VoiceCommandButton;