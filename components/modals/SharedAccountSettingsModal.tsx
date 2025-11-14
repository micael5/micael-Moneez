import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { SharedAccountMember, SharedGoal, Poll, AutomationRule, AuditLog, Category } from '../../types';
import { Edit, Save, Trash2, Plus, Users, Settings, Bot, Activity } from 'lucide-react';

type Tab = 'general' | 'members' | 'automation' | 'logs';

const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

const GeneralTab: React.FC = () => {
    const { state, dispatch } = useApp();
    const { sharedAccount, userId } = state;
    const [accountName, setAccountName] = useState(sharedAccount.name);
    const [isEditingName, setIsEditingName] = useState(false);

    const handleSaveName = () => {
        dispatch({ type: 'UPDATE_SHARED_ACCOUNT_NAME', payload: accountName });
        setIsEditingName(false);
    }

    return (
        <div className="space-y-6">
            <div>
                <label className="text-sm font-medium">Nome da Conta</label>
                <div className="flex items-center gap-2 mt-1">
                    <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} disabled={!isEditingName} className="flex-grow p-2 border rounded-md disabled:bg-gray-100 dark:disabled:bg-gray-700"/>
                    <Button variant="ghost" className="!p-2" onClick={() => isEditingName ? handleSaveName() : setIsEditingName(true)}>
                        {isEditingName ? <Save size={18} /> : <Edit size={18} />}
                    </Button>
                </div>
            </div>

            <div>
                <h4 className="font-semibold mb-2">Metas Compartilhadas</h4>
                <div className="space-y-4">
                {sharedAccount.goals.map(goal => (
                     <div key={goal.id}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium">{goal.name}</span>
                            <span className="text-gray-500">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                        </div>
                        <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
                        <div className="text-xs text-gray-500 mt-1">{formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}</div>
                    </div>
                ))}
                </div>
            </div>

             <div>
                <h4 className="font-semibold mb-2">Enquetes</h4>
                <div className="space-y-3">
                    {sharedAccount.polls.map(poll => (
                        <div key={poll.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="font-medium text-sm mb-2">{poll.question}</p>
                            {poll.options.map(opt => {
                                const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
                                const votePercentage = totalVotes > 0 ? (opt.votes.length / totalVotes) * 100 : 0;
                                const hasVoted = opt.votes.includes(userId);
                                return (
                                <div key={opt.id} className="mb-2">
                                     <div className="flex justify-between items-center text-xs mb-1">
                                        <button onClick={() => dispatch({type: 'VOTE_ON_POLL', payload: { pollId: poll.id, optionId: opt.id }})} className={`font-semibold ${hasVoted ? 'text-indigo-600' : ''}`}>{opt.text}</button>
                                        <span>{opt.votes.length} voto(s)</span>
                                    </div>
                                    <ProgressBar value={votePercentage} max={100} />
                                </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

const MembersTab: React.FC = () => {
    const { state, dispatch } = useApp();
    const { members } = state.sharedAccount;
    const [editingMember, setEditingMember] = useState<SharedAccountMember | null>(null);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if(editingMember) {
            dispatch({ type: 'UPDATE_MEMBER_PROFILE', payload: { memberId: editingMember.id, nickname: editingMember.nickname || '', color: editingMember.color || '#000000' } });
            setEditingMember(null);
        }
    }

    if (editingMember) {
        return (
            <form onSubmit={handleSave} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold">Editando {editingMember.name}</h4>
                <div>
                    <label className="text-sm font-medium">Apelido</label>
                    <input type="text" value={editingMember.nickname} onChange={e => setEditingMember({...editingMember, nickname: e.target.value})} className="w-full mt-1 p-2 border rounded-md" />
                </div>
                 <div>
                    <label className="text-sm font-medium">Cor no Chat</label>
                    <input type="color" value={editingMember.color} onChange={e => setEditingMember({...editingMember, color: e.target.value})} className="w-full mt-1 p-1 h-10 border rounded-md" />
                </div>
                <div className="flex gap-2">
                    <Button type="submit" size="sm">Salvar</Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setEditingMember(null)}>Cancelar</Button>
                </div>
            </form>
        )
    }

    return (
        <div className="space-y-2">
            {members.map(member => (
                <div key={member.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ backgroundColor: member.color ? `${member.color}20` : '#E0E7FF', color: member.color || '#4F46E5' }}>
                        {(member.nickname || member.name).charAt(0)}
                    </div>
                    <div className="ml-3 flex-grow">
                        <p className="text-sm font-semibold">{member.nickname || member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setEditingMember(member)}>Editar Perfil</Button>
                </div>
            ))}
        </div>
    );
}

const AutomationTab: React.FC = () => {
    const { state, dispatch } = useApp();
    const { rules } = state.sharedAccount;
    const { categories } = state;

    const [ruleType, setRuleType] = useState<'split' | 'notify'>('split');
    const [ruleName, setRuleName] = useState('');
    const [triggerValue, setTriggerValue] = useState('');

    useEffect(() => {
        if (ruleType === 'split') {
            const firstCatId = categories.filter(c => c.name !== 'Salário')[0]?.id;
            setTriggerValue(firstCatId || '');
        } else {
            setTriggerValue('');
        }
    }, [ruleType, categories]);


    const handleAddRule = () => {
        if (!ruleName.trim() || !triggerValue) {
            alert("Por favor, preencha todos os campos da regra.");
            return;
        }
        
        if (ruleType === 'split') {
            dispatch({ 
                type: 'ADD_AUTOMATION_RULE', 
                payload: { 
                    name: ruleName.trim(), 
                    trigger: 'new_transaction_category', 
                    triggerValue: triggerValue,
                    action: 'split_equally' 
                } 
            });
        } else if (ruleType === 'notify') {
            const amount = parseFloat(triggerValue);
            if (isNaN(amount) || amount <= 0) {
                alert("Por favor, insira um valor numérico positivo.");
                return;
            }
            dispatch({
                type: 'ADD_AUTOMATION_RULE',
                payload: {
                    name: ruleName.trim(),
                    trigger: 'new_transaction_above_amount',
                    triggerValue: amount,
                    action: 'send_chat_notification'
                }
            });
        }

        setRuleName('');
        if (ruleType === 'split') {
            const firstCatId = categories.filter(c => c.name !== 'Salário')[0]?.id;
            setTriggerValue(firstCatId || '');
        } else {
            setTriggerValue('');
        }
    }

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Desconhecida';

    const renderRuleDescription = (rule: AutomationRule) => {
        if (rule.trigger === 'new_transaction_category' && rule.action === 'split_equally') {
            return `Divide gastos da categoria '${getCategoryName(rule.triggerValue)}'`;
        }
        if (rule.trigger === 'new_transaction_above_amount' && rule.action === 'send_chat_notification') {
            return `Notifica no chat sobre gastos acima de ${formatCurrency(rule.triggerValue)}`;
        }
        return "Regra de automação personalizada.";
    }

    return (
        <div className="space-y-4">
            <div className="p-3 border rounded-lg space-y-3">
                 <h4 className="font-semibold text-sm">Criar Nova Regra de Automação</h4>

                 <div>
                    <label className="text-xs font-medium text-gray-500">1. Escolha um modelo de regra</label>
                    <select value={ruleType} onChange={e => setRuleType(e.target.value as any)} className="w-full p-2 mt-1 border rounded-md text-sm bg-white dark:bg-gray-700">
                        <option value="split">Dividir Gasto por Categoria</option>
                        <option value="notify">Notificar sobre Gasto Alto</option>
                    </select>
                 </div>
                 
                 <div>
                    <label className="text-xs font-medium text-gray-500">2. Dê um nome para a regra</label>
                    <input type="text" placeholder="Ex: Dividir iFood, Alerta de Compras Grandes" value={ruleName} onChange={e => setRuleName(e.target.value)} className="w-full mt-1 p-2 border rounded-md text-sm" />
                 </div>
                 
                 <div>
                    <label className="text-xs font-medium text-gray-500">3. Configure a regra</label>
                    <div className="p-3 mt-1 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        {ruleType === 'split' && (
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span>Quando uma despesa na categoria</span>
                                <select value={triggerValue} onChange={e => setTriggerValue(e.target.value)} className="p-2 border rounded-md bg-white dark:bg-gray-700">
                                    <option value="" disabled>Selecione</option>
                                    {categories.filter(c => c.name !== 'Salário').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <span>for criada, dividir igualmente.</span>
                            </div>
                        )}

                        {ruleType === 'notify' && (
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span>Quando uma despesa acima de R$</span>
                                <input type="number" placeholder="100,00" value={triggerValue} onChange={e => setTriggerValue(e.target.value)} className="w-32 p-2 border rounded-md" />
                                <span>for criada, notificar no chat.</span>
                            </div>
                        )}
                    </div>
                 </div>

                 <Button size="sm" onClick={handleAddRule} disabled={!ruleName.trim() || !triggerValue}><Plus size={14} className="mr-1" /> Adicionar Regra</Button>
            </div>

            <div>
                <h4 className="font-semibold text-sm mb-2">Regras Ativas</h4>
                {rules.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">Nenhuma regra de automação criada.</p>
                ) : (
                    <div className="space-y-2">
                        {rules.map(rule => (
                            <div key={rule.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div>
                                    <p className="font-medium text-sm">{rule.name}</p>
                                    <p className="text-xs text-gray-500">{renderRuleDescription(rule)}</p>
                                </div>
                                <Button variant="ghost" size="sm" className="!p-2 text-red-500" onClick={() => dispatch({ type: 'DELETE_AUTOMATION_RULE', payload: { ruleId: rule.id } })}>
                                    <Trash2 size={16}/>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const LogsTab: React.FC = () => {
    const { state } = useApp();
    const { logs } = state.sharedAccount;

    return (
        <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map(log => (
                <div key={log.id} className="flex items-start text-sm p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-semibold text-xs flex-shrink-0 mr-3">
                        {log.memberName.charAt(0)}
                    </div>
                    <div>
                        <p><span className="font-semibold">{log.memberName}</span> {log.action}</p>
                        <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                </div>
            ))}
        </div>
    )
};


interface SharedAccountSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SharedAccountSettingsModal: React.FC<SharedAccountSettingsModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<Tab>('general');
    
    const tabs: { id: Tab; label: string, icon: React.ElementType }[] = [
        { id: 'general', label: 'Geral', icon: Settings },
        { id: 'members', label: 'Membros', icon: Users },
        { id: 'automation', label: 'Automação', icon: Bot },
        { id: 'logs', label: 'Logs', icon: Activity },
    ];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'general': return <GeneralTab />;
            case 'members': return <MembersTab />;
            case 'automation': return <AutomationTab />;
            case 'logs': return <LogsTab />;
            default: return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configurações da Conta Compartilhada">
            <div className="flex border-b mb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>
            <div>
                {renderContent()}
            </div>
        </Modal>
    );
};

export default SharedAccountSettingsModal;
