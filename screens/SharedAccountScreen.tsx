import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Plus, Users, Gem, Lock, Eye, MessageSquare, Send, MoreVertical, Edit2, Trash2, Shield, Edit, EyeOff, ArrowRightLeft, Pin, X, Bell, Cog, BrainCircuit } from 'lucide-react';
import { SharedAccountMember, PermissionLevel, ChatMessage } from '../types';
import SharedAccountSettingsModal from '../components/modals/SharedAccountSettingsModal';
import { parseChatMessageForAction } from '../services/geminiService';

const permissionStyles: Record<PermissionLevel, { badge: string; text: string; icon: React.ReactNode }> = {
    admin: { badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Administrador', icon: <Shield size={14} /> },
    editor: { badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', text: 'Editor', icon: <Edit size={14} /> },
    readonly: { badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', text: 'Somente Leitura', icon: <EyeOff size={14} /> },
};

const MemberItem: React.FC<{ member: SharedAccountMember; onTransfer: (member: SharedAccountMember) => void }> = ({ member, onTransfer }) => {
    const { state, dispatch } = useApp();
    const currentUser = state.sharedAccount.members.find(m => m.id === state.userId);
    const canManage = currentUser?.permission === 'admin' && currentUser.id !== member.id;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleRemove = () => {
        if (window.confirm(`Tem certeza que deseja remover ${member.name}?`)) {
            dispatch({ type: 'REMOVE_MEMBER', payload: { memberId: member.id } });
        }
        setIsMenuOpen(false);
    };

    const handlePermissionChange = (p: PermissionLevel) => {
        dispatch({ type: 'UPDATE_MEMBER_PERMISSION', payload: { memberId: member.id, permission: p } });
        setIsMenuOpen(false);
    }

    const { badge, text, icon } = permissionStyles[member.permission];

    return (
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
            <div className="relative mr-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300" style={{ backgroundColor: member.color ? `${member.color}20` : undefined, color: member.color || undefined }}>
                    {(member.nickname || member.name).charAt(0).toUpperCase()}
                </div>
                {member.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>}
            </div>
            <div className="flex-grow overflow-hidden">
                <p className="font-semibold text-sm truncate">{member.nickname || member.name} {member.id === state.userId && '(Você)'}</p>
                <div className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full mt-1 ${badge}`}>
                    {icon} {text}
                </div>
            </div>
            {canManage && (
                <div className="relative">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><MoreVertical size={18} /></button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl z-10">
                            <p className="px-4 py-2 text-xs text-gray-400">Alterar permissão</p>
                            <button onClick={() => handlePermissionChange('admin')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Tornar Admin</button>
                            <button onClick={() => handlePermissionChange('editor')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Tornar Editor</button>
                            <button onClick={() => handlePermissionChange('readonly')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Tornar Leitura</button>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                             <button onClick={() => { onTransfer(member); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Transferir para Conta</button>
                            <button onClick={handleRemove} className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">Remover da Conta</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const InviteMemberModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { dispatch } = useApp();
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState<PermissionLevel>('readonly');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'INVITE_MEMBER', payload: { email, permission } });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Convidar Membro">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium">E-mail do convidado</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                    <label htmlFor="permission" className="block text-sm font-medium">Nível de Permissão</label>
                    <select id="permission" value={permission} onChange={e => setPermission(e.target.value as PermissionLevel)} className="mt-1 block w-full px-3 py-2 border rounded-md">
                        <option value="readonly">Somente Leitura</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Enviar Convite</Button>
                </div>
            </form>
        </Modal>
    );
};

const TransferMemberModal: React.FC<{ isOpen: boolean; onClose: () => void; member: SharedAccountMember | null }> = ({ isOpen, onClose, member }) => {
    const { dispatch } = useApp();
    const [selectedAccount, setSelectedAccount] = useState('');
    
    const userAccounts = [ { id: 'acc1', name: 'Conta Pessoal' }, { id: 'acc2', name: 'Conta de Investimentos' } ];

    const handleTransfer = () => {
        if (!member || !selectedAccount) return;
        dispatch({ type: 'REMOVE_MEMBER', payload: { memberId: member.id } });
        onClose();
    };

    if (!member) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Transferir ${member.name}`}>
             <div className="space-y-4">
                <p>Selecione a conta de destino para <strong>{member.name}</strong>.</p>
                <div>
                    <label htmlFor="account" className="block text-sm font-medium">Conta de Destino</label>
                    <select id="account" value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md">
                        <option value="" disabled>Selecione uma conta...</option>
                        {userAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option> )}
                    </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="button" onClick={handleTransfer} disabled={!selectedAccount}><ArrowRightLeft size={16} className="mr-2" />Confirmar</Button>
                </div>
            </div>
        </Modal>
    )
}

const ChatComponent: React.FC = () => {
    const { state, dispatch } = useApp();
    const { sharedAccount, userId, categories } = state;
    const [message, setMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState<{ id: string, text: string } | null>(null);
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [aiSuggestions, setAiSuggestions] = useState<Record<string, any>>({});
    const chatEndRef = useRef<HTMLDivElement>(null);
    const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
    const prevChatLength = useRef(sharedAccount.chat.length);
    const currentUser = state.sharedAccount.members.find(m => m.id === state.userId);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setNotificationPermission(Notification.permission);
            notificationSoundRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        }
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        if (sharedAccount.chat.length > prevChatLength.current) {
            const lastMessage = sharedAccount.chat[sharedAccount.chat.length - 1];
            if (lastMessage.senderId !== userId) {
                notificationSoundRef.current?.play().catch(e => console.error("Error playing sound:", e));
                if (notificationPermission === 'granted' && document.hidden) {
                    const sender = getSender(lastMessage.senderId);
                    const notification = new Notification(`Nova mensagem de ${sender?.nickname || sender?.name || 'Membro'}`, {
                        body: lastMessage.text,
                        icon: '/vite.svg'
                    });
                    notification.onclick = () => {
                        window.focus();
                    };
                }
            }
        }
        prevChatLength.current = sharedAccount.chat.length;
    }, [sharedAccount.chat, userId, notificationPermission]);

    const requestNotificationPermission = () => {
        Notification.requestPermission().then(permission => {
            setNotificationPermission(permission);
        });
    };

    const handleSend = async () => {
        if (message.trim()) {
            const newMessage: ChatMessage = { 
                id: crypto.randomUUID(), 
                senderId: userId, 
                text: message.trim(), 
                timestamp: new Date().toISOString(), 
                isEdited: false 
            };
            dispatch({ type: 'SEND_CHAT_MESSAGE', payload: newMessage });
            
            // Check for AI action
            const suggestion = await parseChatMessageForAction(message.trim());
            if (suggestion) {
                setAiSuggestions(prev => ({...prev, [newMessage.id]: suggestion}));
            }
            setMessage('');
        }
    };
    
    const handleEditSend = () => {
        if (editingMessage && editingMessage.text.trim()) {
            dispatch({ type: 'EDIT_CHAT_MESSAGE', payload: { messageId: editingMessage.id, newText: editingMessage.text.trim() } });
            setEditingMessage(null);
        }
    }

    const handleDelete = (id: string) => dispatch({ type: 'DELETE_CHAT_MESSAGE', payload: { messageId: id } });
    const handlePin = (id: string) => dispatch({ type: 'PIN_CHAT_MESSAGE', payload: { messageId: id } });
    
    const getSender = (id: string) => sharedAccount.members.find(m => m.id === id);
    
    const pinnedMessage = sharedAccount.pinnedMessageId ? sharedAccount.chat.find(m => m.id === sharedAccount.pinnedMessageId) : null;
    const pinnedMessageSender = pinnedMessage ? getSender(pinnedMessage.senderId) : null;
    
    const handleAiSuggestion = (messageId: string, suggestion: any) => {
        if (suggestion.acao === 'criar_transacao') {
            const { amount, description, type } = suggestion.parametros;
            const categoryKeywords: Record<string, string> = {
                'Alimentação': 'mercado|restaurante|pizza|comida|ifood',
                'Transporte': 'uber|99|gasolina|ônibus|metrô',
                'Saúde': 'farmácia|remédio|médico|consulta',
                'Lazer': 'cinema|show|bar|festa'
            };
            let foundCategoryId = '10'; // Default to "Outros"
            for (const cat of categories) {
                const keywords = categoryKeywords[cat.name];
                if (keywords && new RegExp(keywords, 'i').test(description)) {
                    foundCategoryId = cat.id;
                    break;
                }
            }

            dispatch({
                type: 'OPEN_TRANSACTION_MODAL',
                payload: {
                    type: type || 'expense',
                    defaultValue: {
                        amount,
                        description: description.charAt(0).toUpperCase() + description.slice(1),
                        categoryId: foundCategoryId,
                    }
                }
            });
        }
        if (suggestion.acao === 'criar_lembrete') {
            dispatch({ type: 'OPEN_BILL_MODAL' });
        }
        setAiSuggestions(prev => {
            const newSuggestions = {...prev};
            delete newSuggestions[messageId];
            return newSuggestions;
        });
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <header className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-base">💬 Chat Financeiro</h3>
                    <p className="text-xs text-gray-500">{sharedAccount.members.filter(m => m.isOnline).length} membro(s) online</p>
                </div>
                {notificationPermission === 'default' && (
                    <Button size="sm" variant="ghost" onClick={requestNotificationPermission}><Bell size={14} className="mr-1"/> Ativar Notificações</Button>
                )}
            </header>
            
            {pinnedMessage && (
                <div className="p-2 border-b dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/30 flex items-center gap-2">
                    <Pin size={14} className="text-indigo-500 flex-shrink-0" />
                    <div className="flex-grow text-xs overflow-hidden">
                        <p className="font-bold text-indigo-700 dark:text-indigo-300">Fixado por {pinnedMessageSender?.nickname || pinnedMessageSender?.name}</p>
                        <p className="truncate text-gray-600 dark:text-gray-300">{pinnedMessage.text}</p>
                    </div>
                    {currentUser?.permission === 'admin' && (
                        <button onClick={() => dispatch({ type: 'UNPIN_CHAT_MESSAGE' })} className="p-1.5 rounded-full hover:bg-black/10"><X size={14} /></button>
                    )}
                </div>
            )}

            <div className="flex-grow p-4 space-y-2 overflow-y-auto">
                {sharedAccount.chat.map(msg => {
                    const sender = getSender(msg.senderId);
                    const isMe = msg.senderId === userId;
                    const suggestion = aiSuggestions[msg.id];
                    return (
                        <div key={msg.id}>
                            <div className={`flex items-end gap-2 group ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ backgroundColor: sender?.color ? `${sender.color}20` : undefined, color: sender?.color || undefined }}>{(sender?.nickname || sender?.name || '?').charAt(0)}</div>}
                                {isMe && currentUser?.permission === 'admin' && <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                                    <button onClick={() => handlePin(msg.id)} className="p-1 hover:text-yellow-500" title="Fixar mensagem"><Pin size={12}/></button>
                                    <button onClick={() => setEditingMessage({id: msg.id, text: msg.text})} className="p-1 hover:text-blue-500"><Edit2 size={12}/></button>
                                    <button onClick={() => handleDelete(msg.id)} className="p-1 hover:text-red-500"><Trash2 size={12}/></button>
                                </div>}
                                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 rounded-bl-none'}`} style={{ backgroundColor: isMe ? currentUser?.color : undefined }}>
                                    {!isMe && <p className="font-bold text-xs mb-1" style={{color: sender?.color || 'var(--color-indigo-400)'}}>{sender?.nickname || sender?.name}</p>}
                                    <p className="text-sm">{msg.text}</p>
                                    <p className={`text-xs mt-1 opacity-70 text-right ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        {msg.isEdited && ' (editado)'}
                                    </p>
                                </div>
                            </div>
                            {suggestion && (
                                <div className={`mt-2 p-2 bg-indigo-50 dark:bg-gray-700/50 rounded-lg flex items-center gap-2 animate-fade-in ${isMe ? 'ml-auto' : 'ml-10'}`} style={{ maxWidth: 'calc(100% - 2.5rem)'}}>
                                    <BrainCircuit size={16} className="text-indigo-500 flex-shrink-0" />
                                    <p className="text-xs text-indigo-800 dark:text-indigo-200 flex-grow">Sugestão: {suggestion.acao === 'criar_transacao' ? `Registrar despesa de ${suggestion.parametros.description}?` : 'Criar um lembrete?'}</p>
                                    <Button size="sm" onClick={() => handleAiSuggestion(msg.id, suggestion)}>Sim</Button>
                                </div>
                            )}
                        </div>
                    )
                })}
                <div ref={chatEndRef} />
            </div>
            {editingMessage ? (
                 <div className="p-3 border-t dark:border-gray-700 flex items-center gap-2">
                    <input type="text" value={editingMessage.text} onChange={(e) => setEditingMessage({...editingMessage, text: e.target.value})} className="flex-grow bg-white dark:bg-gray-700 border rounded-lg px-3 py-2 text-sm" />
                    <Button size="sm" onClick={handleEditSend}>Salvar</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingMessage(null)}>Cancelar</Button>
                </div>
            ) : (
                <div className="p-3 border-t dark:border-gray-700 flex items-center gap-2">
                    <input type="text" placeholder="Digite sua mensagem..." value={message} onChange={e => setMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} className="flex-grow bg-white dark:bg-gray-700 border rounded-lg px-3 py-2 text-sm" />
                    <Button onClick={handleSend} className="!p-2.5"><Send size={18} /></Button>
                </div>
            )}
        </div>
    );
};

const SharedAccountScreen: React.FC = () => {
    const { state, dispatch } = useApp();
    const { subscriptionPlan, sharedAccount } = state;
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [memberToTransfer, setMemberToTransfer] = useState<SharedAccountMember | null>(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const handleOpenTransferModal = (member: SharedAccountMember) => {
        setMemberToTransfer(member);
        setIsTransferModalOpen(true);
    };

    if (subscriptionPlan === 'free' && !isDemoMode) {
        return (
            <div className="pb-16 md:pb-0">
                <Header title="Conta Compartilhada" />
                <Card className="flex flex-col items-center justify-center text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50">
                    <Lock size={48} className="mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold">💎 Comunicação é a chave do sucesso financeiro!</h3>
                    <p className="max-w-md mt-2 text-sm text-gray-600 dark:text-gray-300">
                       Converse com sua família ou parceiros sobre metas e despesas. Recurso exclusivo para assinantes Premium.
                    </p>
                    <div className="flex gap-4 mt-6">
                        <Button variant="secondary" onClick={() => setIsDemoMode(true)}><Eye className="w-4 h-4 mr-2" />Ver Demonstração</Button>
                        <Button onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'subscription' })}><Gem className="w-4 h-4 mr-2" />Seja Premium</Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="pb-16 md:pb-0 h-full flex flex-col">
            <Header title={sharedAccount.name} actions={
                <>
                    <Button onClick={() => setIsInviteModalOpen(true)}>
                        <Plus size={16} className="mr-2" />
                        Convidar
                    </Button>
                    <Button variant="ghost" className="!p-2" onClick={() => setIsSettingsModalOpen(true)}>
                        <Cog size={20} />
                    </Button>
                </>
            } />
            {isDemoMode && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 text-sm rounded-md mb-4" role="alert">
                    <p><strong className="font-bold">Modo Demonstração:</strong> Suas alterações não serão salvas.</p>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow min-h-0">
                <Card className="lg:col-span-1 flex flex-col">
                    <h3 className="text-base font-semibold mb-3">Membros da Conta</h3>
                    <div className="flex-grow space-y-2 overflow-y-auto -mx-3 px-3">
                        {sharedAccount.members.map(m => <MemberItem key={m.id} member={m} onTransfer={handleOpenTransferModal} />)}
                    </div>
                </Card>
                <div className="lg:col-span-2 min-h-[400px] lg:min-h-0">
                    <ChatComponent />
                </div>
            </div>
            <InviteMemberModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
            <TransferMemberModal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} member={memberToTransfer} />
            <SharedAccountSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
        </div>
    );
};

export default SharedAccountScreen;