import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ImpulseBlock, ImpulseBlockStatus } from '../types';
import { ShieldBan, ShieldCheck, ShieldX, ShieldQuestion, Zap, Repeat, Clock, TrendingUp, TrendingDown, Check, X } from 'lucide-react';

const reasonInfo: Record<ImpulseBlock['reason'], { icon: React.ReactNode; title: string }> = {
    rapid_purchases: { icon: <Zap className="text-red-500" />, title: 'Compras Rápidas' },
    repeated_purchase: { icon: <Repeat className="text-orange-500" />, title: 'Compra Repetida' },
    risky_time: { icon: <Clock className="text-purple-500" />, title: 'Horário de Risco' },
};

const riskInfo: Record<ImpulseBlock['riskLevel'], { text: string; color: string; icon: React.ReactNode }> = {
    baixo: { text: 'Baixo', color: 'border-green-500', icon: <TrendingUp size={14} /> },
    médio: { text: 'Médio', color: 'border-yellow-500', icon: <TrendingUp size={14} /> },
    alto: { text: 'Alto', color: 'border-orange-500', icon: <TrendingDown size={14} /> },
    crítico: { text: 'Crítico', color: 'border-red-500', icon: <TrendingDown size={14} /> },
};

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
};

const ImpulseBlockCard: React.FC<{ block: ImpulseBlock }> = ({ block }) => {
    const { dispatch } = useApp();
    const { blockedTransaction } = block;

    const handleConfirm = () => {
        dispatch({ type: 'PROCESS_IMPULSE_BLOCK', payload: { blockId: block.id, action: 'confirm' } });
        dispatch({ type: 'SHOW_TOAST', payload: 'Gasto confirmado e adicionado!' });
    };

    const handleCancel = () => {
        dispatch({ type: 'PROCESS_IMPULSE_BLOCK', payload: { blockId: block.id, action: 'delete' } });
         dispatch({ type: 'SHOW_TOAST', payload: 'Gasto cancelado.' });
    };

    const info = reasonInfo[block.reason];
    const risk = riskInfo[block.riskLevel];
    const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

    return (
        <Card className={`border-l-4 ${risk.color}`}>
            <div className="flex items-start">
                <div className="mr-4 mt-1">{info.icon}</div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold">{info.title}</h3>
                            <p className="text-xs text-gray-500">{new Date(block.timestamp).toLocaleString('pt-BR')}</p>
                        </div>
                        <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${risk.color.replace('border-', 'bg-').replace('-500', '-100 dark:bg-opacity-20')} ${risk.color.replace('border-', 'text-')}`}>
                            Risco: {risk.text}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 my-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">"{block.message}"</p>
                    
                    <div className="flex items-center justify-between p-2 mt-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <p className="font-medium">{blockedTransaction.description}</p>
                        <p className="font-bold">{formatCurrency(blockedTransaction.amount)}</p>
                    </div>

                    {block.status === 'pending' && (
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="secondary" size="sm" onClick={handleCancel}><X size={14} className="mr-1"/> Excluir Gasto</Button>
                            <Button size="sm" onClick={handleConfirm} className="bg-green-600 hover:bg-green-700 focus:ring-green-500"><Check size={14} className="mr-1"/> Confirmar Gasto</Button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

const ImpulseBlocksScreen: React.FC = () => {
    const { state, dispatch } = useApp();
    const { impulseBlocks, isAntiImpulseModeEnabled } = state;
    const [filter, setFilter] = useState<ImpulseBlockStatus>('pending');
    
    const filteredBlocks = useMemo(() => {
        return impulseBlocks.filter(b => b.status === filter);
    }, [impulseBlocks, filter]);

    return (
        <div className="space-y-6 pb-16 md:pb-0">
            <Header title="Modo Anti-Impulso" />
            
             <Card className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <ShieldBan size={24} className="text-indigo-500 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold">Bloqueio Inteligente de Gastos</h3>
                        <p className="text-sm text-gray-500">O sistema está {isAntiImpulseModeEnabled ? 'ativo' : 'inativo'}.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Modo Ativo</span>
                    <ToggleSwitch checked={isAntiImpulseModeEnabled} onChange={() => dispatch({type: 'TOGGLE_ANTI_IMPULSE_MODE'})} />
                </div>
             </Card>

            <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-center">Histórico de Bloqueios</h3>
                <div className="flex justify-center gap-2">
                    <Button variant={filter === 'pending' ? 'primary' : 'ghost'} onClick={() => setFilter('pending')}>
                        <ShieldQuestion className="mr-2" size={16} /> Pendentes
                    </Button>
                    <Button variant={filter === 'confirmed' ? 'primary' : 'ghost'} onClick={() => setFilter('confirmed')}>
                        <ShieldCheck className="mr-2" size={16} /> Confirmados
                    </Button>
                    <Button variant={filter === 'deleted' ? 'primary' : 'ghost'} onClick={() => setFilter('deleted')}>
                        <ShieldX className="mr-2" size={16} /> Cancelados
                    </Button>
                </div>
            </Card>

            {filteredBlocks.length > 0 ? (
                <div className="space-y-4">
                    {filteredBlocks.map(block => <ImpulseBlockCard key={block.id} block={block} />)}
                </div>
            ) : (
                <Card>
                    <div className="text-center py-16 text-gray-500">
                        <ShieldCheck size={48} className="mx-auto mb-4 text-green-500" />
                        <h3 className="font-semibold text-lg">Nenhum bloqueio encontrado!</h3>
                        <p className="text-sm mt-1">Não há gastos {filter === 'pending' ? 'pendentes de análise' : (filter === 'confirmed' ? 'confirmados' : 'cancelados')} no momento.</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ImpulseBlocksScreen;