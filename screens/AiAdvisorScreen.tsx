import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Send, Gem, Lock, FileDown } from 'lucide-react';
import { generateAiAdvisorResponse } from '../services/geminiService';
import { exportToPdf } from '../services/pdfService';
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

const AiAdvisorScreen: React.FC = () => {
    const { state, dispatch } = useApp();
    const { subscriptionPlan, transactions, categories, goals, userName } = state;

    const [messages, setMessages] = useState<Message[]>([
        { id: crypto.randomUUID(), sender: 'ai', text: `Olá, ${userName}! Eu sou seu consultor financeiro IA. Como posso te ajudar a conquistar seus objetivos hoje? 🚀` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isPremium = subscriptionPlan === 'premium';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent, query?: string) => {
        e.preventDefault();
        const userMessage = (query || input).trim();
        if (!userMessage || isLoading) return;

        const newUserMessage: Message = { id: crypto.randomUUID(), sender: 'user', text: userMessage };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponseText = await generateAiAdvisorResponse(userMessage, transactions, categories, goals, userName);
            const newAiMessage: Message = { id: crypto.randomUUID(), sender: 'ai', text: aiResponseText };
            setMessages(prev => [...prev, newAiMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = { id: crypto.randomUUID(), sender: 'ai', text: "Ocorreu um erro ao conectar com a IA. Por favor, tente novamente." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGeneratePdf = (reportContent: string) => {
        const reportElementId = 'pdf-report-container';
        let container = document.getElementById(reportElementId);
        if (!container) {
            container = document.createElement('div');
            container.id = reportElementId;
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.width = '800px';
            container.style.padding = '40px';
            container.style.backgroundColor = 'white';
            container.style.color = 'black';
            container.innerHTML = `<style>
                #${reportElementId} { font-family: 'Inter', sans-serif; font-size: 12px; }
                #${reportElementId} h1 { font-size: 2em; margin-bottom: 1em; color: #4F46E5; }
                #${reportElementId} h3 { font-size: 1.2em; margin-top: 1.5em; margin-bottom: 0.5em; color: #333; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
                #${reportElementId} p { margin-bottom: 0.5em; line-height: 1.6; }
                #${reportElementId} strong { font-weight: bold; color: #111; }
            </style><h1>Relatório Financeiro por IA</h1>`;
            document.body.appendChild(container);
        }
        
        let htmlContent = reportContent
            .replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br />');

        container.innerHTML += htmlContent;
        
        exportToPdf(reportElementId, 'relatorio_financeiro_ia.pdf').then(() => {
             if(container) container.innerHTML = '';
        });
    };
    
    const QuickActionButton: React.FC<{label: string, query: string}> = ({ label, query }) => (
        <button
            onClick={(e) => handleSendMessage(e as any, query)}
            disabled={isLoading}
            className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-1.5 px-3 rounded-full transition-colors disabled:opacity-50"
        >
            {label}
        </button>
    );

    if (!isPremium) {
         return (
            <div className="pb-16 md:pb-0 h-full flex flex-col">
                <Header title="Consultor IA" />
                <Card className="flex-grow flex flex-col items-center justify-center text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50">
                    <Lock size={48} className="mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Converse com uma IA especialista em finanças</h3>
                    <p className="max-w-md mt-2 text-sm text-gray-600 dark:text-gray-300">
                        Receba análises automáticas, relatórios personalizados e dicas em tempo real para turbinar sua jornada financeira.
                    </p>
                    <Button onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'subscription' })} className="mt-6">
                        <Gem className="w-4 h-4 mr-2" />
                        Desbloquear com o Premium
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col pb-16 md:pb-0">
            <Header title="Consultor IA" />
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isAI = msg.sender === 'ai';
                    const reportRegex = /\[GERAR_PDF\]/g;
                    const hasPdfAction = reportRegex.test(msg.text);
                    const cleanText = msg.text.replace(reportRegex, '').trim();

                    return (
                        <div key={msg.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-lg lg:max-w-2xl px-4 py-3 rounded-2xl shadow-sm ${isAI ? 'bg-indigo-600 text-white rounded-bl-none' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-br-none'}`}>
                                <div className="prose prose-sm prose-p:text-current prose-strong:text-current dark:prose-invert max-w-none">
                                    <ReactMarkdown>{cleanText}</ReactMarkdown>
                                </div>
                                {hasPdfAction && (
                                    <Button size="sm" variant="secondary" className="mt-3 bg-white/20 hover:bg-white/30 text-white" onClick={() => handleGeneratePdf(cleanText)}>
                                        <FileDown size={14} className="mr-2" />
                                        Baixar Relatório PDF
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="px-4 py-3 rounded-2xl bg-indigo-600 text-white rounded-bl-none">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                 <div className="mb-3 flex flex-wrap gap-2 justify-center">
                    <QuickActionButton label="Quanto gastei com comida?" query="Quanto gastei com comida este mês?" />
                    <QuickActionButton label="Como estou nas minhas metas?" query="Como estou progredindo nas minhas metas?" />
                    <QuickActionButton label="Me dê uma dica de economia" query="Me dê uma dica de economia com base nos meus gastos." />
                </div>
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-grow block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 disabled:bg-gray-200 dark:disabled:bg-gray-700"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="lg" disabled={!input.trim() || isLoading} className="!p-3 flex-shrink-0">
                        <Send size={20} />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AiAdvisorScreen;
