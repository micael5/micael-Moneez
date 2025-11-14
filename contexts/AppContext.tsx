import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { Screen, Transaction, Category, Goal, Bill, SubscriptionPlan, TransactionType, BillStatus, SharedAccountMember, PermissionLevel, ChatMessage, Challenge, SharedGoal, Poll, AutomationRule, AuditLog, SharedAccount, ScheduledPayment, PaymentMethod, SuspiciousTransaction, SuspiciousTransactionStatus, ImpulseBlock } from '../types';
import { analyzeSuspiciousTransactions } from '../services/suspiciousTransactionService';
import { analyzeImpulsiveSpending } from '../services/antiImpulseService';

// --- INITIAL STATE & MOCK DATA ---

const MOCK_CATEGORIES: Category[] = [
    { id: '1', name: 'Moradia', icon: '🏠' },
    { id: '2', name: 'Transporte', icon: '🚗' },
    { id: '3', name: 'Alimentação', icon: '🍔' },
    { id: '4', name: 'Lazer', icon: '🎬' },
    { id: '5', name: 'Saúde', icon: '❤️' },
    { id: '6', name: 'Educação', icon: '📚' },
    { id: '7', name: 'Salário', icon: '💰' },
    { id: '8', name: 'Contas', icon: '🧾' },
    { id: '9', name: 'Investimentos', icon: '📈' },
    { id: '10', name: 'Outros', icon: '💸' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 't1', type: 'income', amount: 5000, description: 'Salário Mensal', categoryId: '7', date: new Date(new Date().setDate(1)).toISOString().split('T')[0] },
    { id: 't2', type: 'expense', amount: 1500, description: 'Aluguel', categoryId: '1', date: new Date(new Date().setDate(5)).toISOString().split('T')[0] },
    { id: 't3', type: 'expense', amount: 80, description: 'Uber', categoryId: '2', date: new Date(new Date().setDate(7)).toISOString().split('T')[0] },
    { id: 't4', type: 'expense', amount: 450, description: 'Supermercado', categoryId: '3', date: new Date(new Date().setDate(10)).toISOString().split('T')[0] },
    { id: 't5', type: 'expense', amount: 120, description: 'Cinema', categoryId: '4', date: new Date(new Date().setDate(12)).toISOString().split('T')[0] },
    { id: 't6', type: 'expense', amount: 200, description: 'Mensalidade Academia', categoryId: '5', date: new Date(new Date().setDate(15)).toISOString().split('T')[0] },
];

const MOCK_GOALS: Goal[] = [
    { id: 'g1', name: 'Viagem para a Praia', targetAmount: 2000, currentAmount: 850, deadline: '2024-12-31' },
    { id: 'g2', name: 'Novo Celular', targetAmount: 4000, currentAmount: 1200, deadline: '2024-11-30' },
];

const MOCK_CHALLENGES: Challenge[] = [
    { id: 'ch1', name: 'Desafio do Cafezinho', description: 'Economize o dinheiro que gastaria com cafés fora de casa por 30 dias.', icon: '☕', targetAmount: 150, currentAmount: 45, durationDays: 30, startDate: new Date().toISOString(), status: 'active' },
    { id: 'ch2', name: 'Semana sem Gastos Supérfluos', description: 'Passe 7 dias comprando apenas o estritamente essencial.', icon: '🛒', targetAmount: 200, currentAmount: 200, durationDays: 7, startDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(), status: 'completed' },
];

const MOCK_BILLS: Bill[] = [
    { id: 'b1', name: 'Conta de Luz', amount: 150, dueDate: new Date(new Date().setDate(20)).toISOString().split('T')[0], categoryId: '8', status: 'pending' },
    { id: 'b2', name: 'Internet', amount: 99, dueDate: new Date(new Date().setDate(25)).toISOString().split('T')[0], categoryId: '8', status: 'pending' },
    { id: 'b3', name: 'Plano de Saúde', amount: 450, dueDate: new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setDate(28)).toISOString().split('T')[0], categoryId: '5', status: 'paid' },
];

const MOCK_SCHEDULED_PAYMENTS: ScheduledPayment[] = [
    { id: 'sp1', name: 'Netflix', amount: 39.90, isVariable: false, paymentDay: 10, paymentMethod: 'debit', categoryId: '4', isActive: true },
    { id: 'sp2', name: 'Conta de Energia', amount: 180, isVariable: true, paymentDay: 15, paymentMethod: 'boleto', categoryId: '8', isActive: true },
    { id: 'sp3', name: 'Plano de Celular', amount: 59.90, isVariable: false, paymentDay: 25, paymentMethod: 'credit', categoryId: '8', isActive: false },
];

const MOCK_SHARED_ACCOUNT_MEMBERS: SharedAccountMember[] = [
    { id: 'user1', name: 'Você', email: 'voce@email.com', permission: 'admin', isOnline: true, nickname: 'Admin Chefe', color: '#4F46E5' },
    { id: 'user2', name: 'Cônjuge', email: 'conjuge@email.com', permission: 'editor', isOnline: true, nickname: 'Amor', color: '#EC4899' },
    { id: 'user3', name: 'Filho(a)', email: 'filho@email.com', permission: 'readonly', isOnline: false, nickname: 'Junior', color: '#F59E0B' },
];

const MOCK_CHAT_MESSAGES: ChatMessage[] = [
    { id: 'c1', senderId: 'user2', text: 'Não esquece de pagar a conta de luz!', timestamp: new Date().toISOString(), isEdited: false },
    { id: 'c2', senderId: 'user1', text: 'Pode deixar, vou pagar amanhã.', timestamp: new Date().toISOString(), isEdited: false },
];

const MOCK_SHARED_GOALS: SharedGoal[] = [
    { id: 'sg1', name: 'Férias em Família', targetAmount: 5000, currentAmount: 1500, contributions: [{ memberId: 'user1', amount: 1000 }, { memberId: 'user2', amount: 500 }] }
];
const MOCK_POLLS: Poll[] = [
    { id: 'p1', question: 'Devemos comprar a nova TV 4K?', createdBy: 'user2', options: [{ id: 'o1', text: 'Sim', votes: ['user2'] }, { id: 'o2', text: 'Não', votes: ['user1'] }], isOpen: true }
];
const MOCK_RULES: AutomationRule[] = [
    { id: 'r1', name: "Dividir gastos com 'Alimentação'", trigger: 'new_transaction_category', triggerValue: '3', action: 'split_equally' }
];
const MOCK_LOGS: AuditLog[] = [
    { id: 'l1', timestamp: new Date().toISOString(), memberId: 'user2', memberName: 'Cônjuge', action: 'Enviou a mensagem "Não esquece de pagar a conta de luz!"' },
    { id: 'l2', timestamp: new Date().toISOString(), memberId: 'user1', memberName: 'Você', action: 'Convidou o membro "Filho(a)"' },
];

// --- TYPES ---

export interface AppState {
    userName: string | null;
    userId: string;
    currentScreen: Screen;
    transactions: Transaction[];
    categories: Category[];
    goals: Goal[];
    challenges: Challenge[];
    bills: Bill[];
    subscriptionPlan: SubscriptionPlan;
    isTransactionModalOpen: boolean;
    transactionModalDefaultValue: Partial<Transaction> | null;
    transactionModalType: TransactionType | null;
    isBillModalOpen: boolean;
    isGoalModalOpen: boolean;
    isCategoryModalOpen: boolean;
    isChallengeModalOpen: boolean;
    isPremiumUpsellModalOpen: boolean;
    isMobileMenuOpen: boolean;
    monthlyBudget: number;
    minBalanceGoal: number;
    sharedAccount: SharedAccount;
    scheduledPayments: ScheduledPayment[];
    isScheduledPaymentModalOpen: boolean;
    scheduledPaymentToEdit: ScheduledPayment | null;
    suspiciousTransactions: SuspiciousTransaction[];
    toastMessage: string | null;
    // Anti-Impulse Mode State
    isAntiImpulseModeEnabled: boolean;
    impulseBlocks: ImpulseBlock[];
    isImpulseBlockModalOpen: boolean;
    blockedTransactionReview: ImpulseBlock | null;
}

type Action =
    | { type: 'LOGIN'; payload: { userName: string } }
    | { type: 'LOGOUT' }
    | { type: 'SET_SCREEN'; payload: Screen }
    | { type: 'OPEN_TRANSACTION_MODAL'; payload: { type: TransactionType, defaultValue?: Partial<Transaction> } }
    | { type: 'CLOSE_TRANSACTION_MODAL' }
    | { type: 'ADD_TRANSACTION'; payload: Transaction }
    | { type: 'OPEN_BILL_MODAL' }
    | { type: 'CLOSE_BILL_MODAL' }
    | { type: 'ADD_BILL'; payload: Bill }
    | { type: 'UPDATE_BILL_STATUS'; payload: { id: string; status: BillStatus } }
    | { type: 'OPEN_GOAL_MODAL' }
    | { type: 'CLOSE_GOAL_MODAL' }
    | { type: 'ADD_GOAL'; payload: Goal }
    | { type: 'OPEN_CATEGORY_MODAL' }
    | { type: 'CLOSE_CATEGORY_MODAL' }
    | { type: 'ADD_CATEGORY'; payload: Category }
    | { type: 'OPEN_CHALLENGE_MODAL' }
    | { type: 'CLOSE_CHALLENGE_MODAL' }
    | { type: 'ADD_CHALLENGE'; payload: Challenge }
    | { type: 'OPEN_PREMIUM_UPSELL_MODAL' }
    | { type: 'CLOSE_PREMIUM_UPSELL_MODAL' }
    | { type: 'OPEN_MOBILE_MENU' }
    | { type: 'CLOSE_MOBILE_MENU' }
    | { type: 'SET_SUBSCRIPTION_PLAN'; payload: SubscriptionPlan }
    | { type: 'SET_MONTHLY_BUDGET'; payload: number }
    | { type: 'SET_MIN_BALANCE_GOAL'; payload: number }
    | { type: 'INVITE_MEMBER'; payload: { email: string, permission: PermissionLevel } }
    | { type: 'REMOVE_MEMBER'; payload: { memberId: string } }
    | { type: 'UPDATE_MEMBER_PERMISSION'; payload: { memberId: string, permission: PermissionLevel } }
    | { type: 'SEND_CHAT_MESSAGE'; payload: ChatMessage }
    | { type: 'EDIT_CHAT_MESSAGE'; payload: { messageId: string, newText: string } }
    | { type: 'DELETE_CHAT_MESSAGE'; payload: { messageId: string } }
    | { type: 'PIN_CHAT_MESSAGE'; payload: { messageId: string } }
    | { type: 'UNPIN_CHAT_MESSAGE' }
    | { type: 'UPDATE_SHARED_ACCOUNT_NAME', payload: string }
    | { type: 'UPDATE_MEMBER_PROFILE', payload: { memberId: string, nickname: string, color: string } }
    | { type: 'ADD_SHARED_GOAL', payload: { name: string, targetAmount: number } }
    | { type: 'CONTRIBUTE_TO_SHARED_GOAL', payload: { goalId: string, amount: number } }
    | { type: 'ADD_POLL', payload: { question: string, options: string[] } }
    | { type: 'VOTE_ON_POLL', payload: { pollId: string, optionId: string } }
    | { type: 'ADD_AUTOMATION_RULE', payload: Omit<AutomationRule, 'id'> }
    | { type: 'DELETE_AUTOMATION_RULE', payload: { ruleId: string } }
    | { type: 'OPEN_SCHEDULED_PAYMENT_MODAL'; payload?: ScheduledPayment }
    | { type: 'CLOSE_SCHEDULED_PAYMENT_MODAL' }
    | { type: 'ADD_SCHEDULED_PAYMENT'; payload: ScheduledPayment }
    | { type: 'UPDATE_SCHEDULED_PAYMENT'; payload: ScheduledPayment }
    | { type: 'DELETE_SCHEDULED_PAYMENT'; payload: { id: string } }
    | { type: 'SET_SUSPICIOUS_TRANSACTIONS'; payload: SuspiciousTransaction[] }
    | { type: 'UPDATE_SUSPICIOUS_TRANSACTION_STATUS'; payload: { id: string; status: SuspiciousTransactionStatus } }
    | { type: 'SHOW_TOAST'; payload: string }
    | { type: 'HIDE_TOAST' }
    // Anti-Impulse Mode Actions
    | { type: 'TOGGLE_ANTI_IMPULSE_MODE' }
    | { type: 'ADD_IMPULSE_BLOCK'; payload: ImpulseBlock }
    | { type: 'PROCESS_IMPULSE_BLOCK'; payload: { blockId: string; action: 'confirm' | 'delete' } }
    | { type: 'OPEN_IMPULSE_BLOCK_MODAL'; payload: ImpulseBlock }
    | { type: 'CLOSE_IMPULSE_BLOCK_MODAL' };


// --- CONTEXT & REDUCER ---

interface AppContextType {
    state: AppState;
    dispatch: Dispatch<Action>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const initialState: AppState = {
    userName: null,
    userId: 'user1',
    currentScreen: 'dashboard',
    transactions: MOCK_TRANSACTIONS,
    categories: MOCK_CATEGORIES,
    goals: MOCK_GOALS,
    challenges: MOCK_CHALLENGES,
    bills: MOCK_BILLS,
    subscriptionPlan: 'free',
    isTransactionModalOpen: false,
    transactionModalDefaultValue: null,
    transactionModalType: null,
    isBillModalOpen: false,
    isGoalModalOpen: false,
    isCategoryModalOpen: false,
    isChallengeModalOpen: false,
    isPremiumUpsellModalOpen: false,
    isMobileMenuOpen: false,
    monthlyBudget: 0,
    minBalanceGoal: 500,
    sharedAccount: {
        id: 'sa1',
        name: 'Despesas da Casa',
        members: MOCK_SHARED_ACCOUNT_MEMBERS,
        chat: MOCK_CHAT_MESSAGES,
        pinnedMessageId: null,
        goals: MOCK_SHARED_GOALS,
        polls: MOCK_POLLS,
        rules: MOCK_RULES,
        logs: MOCK_LOGS,
    },
    scheduledPayments: MOCK_SCHEDULED_PAYMENTS,
    isScheduledPaymentModalOpen: false,
    scheduledPaymentToEdit: null,
    suspiciousTransactions: [],
    toastMessage: null,
    // Anti-Impulse Mode State
    isAntiImpulseModeEnabled: true,
    impulseBlocks: [],
    isImpulseBlockModalOpen: false,
    blockedTransactionReview: null,
};

const addLog = (state: AppState, actionText: string): AppState => {
    const currentUser = state.sharedAccount.members.find(m => m.id === state.userId);
    const newLog: AuditLog = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        memberId: state.userId,
        memberName: currentUser?.nickname || currentUser?.name || 'Usuário',
        action: actionText,
    };
    return {
        ...state,
        sharedAccount: {
            ...state.sharedAccount,
            logs: [newLog, ...state.sharedAccount.logs].slice(0, 100) // Keep last 100 logs
        }
    };
};

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'LOGIN':
            const members = state.sharedAccount.members.map(m => m.id === state.userId ? {...m, name: action.payload.userName, nickname: action.payload.userName} : m);
            return { ...state, userName: action.payload.userName, sharedAccount: {...state.sharedAccount, members } };
        case 'LOGOUT':
            return { ...initialState };
        case 'SET_SCREEN':
            return { ...state, currentScreen: action.payload };
        case 'OPEN_TRANSACTION_MODAL':
            return { ...state, isTransactionModalOpen: true, transactionModalType: action.payload.type, transactionModalDefaultValue: action.payload.defaultValue || null };
        case 'CLOSE_TRANSACTION_MODAL':
            return { ...state, isTransactionModalOpen: false, transactionModalType: null, transactionModalDefaultValue: null };
        case 'ADD_TRANSACTION':
            // --- ANTI-IMPULSE & SUSPICIOUS TRANSACTION INTERCEPTION ---
            if (action.payload.type === 'expense' && state.subscriptionPlan === 'premium') {
                // Anti-Impulse Check
                if (state.isAntiImpulseModeEnabled) {
                    const impulseBlock = analyzeImpulsiveSpending(action.payload, state.transactions);
                    if (impulseBlock) {
                        return {
                            ...state,
                            impulseBlocks: [impulseBlock, ...state.impulseBlocks],
                            isImpulseBlockModalOpen: true,
                            blockedTransactionReview: impulseBlock
                        };
                    }
                }
                
                // Suspicious Transaction Check (this happens after impulse check passes)
                const newSuspicious = analyzeSuspiciousTransactions(action.payload, [action.payload, ...state.transactions], state.categories);
                if (newSuspicious) {
                     const newTransactions = [action.payload, ...state.transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const loggedState = addLog(state, `Adicionou a transação "${action.payload.description}" de R$${action.payload.amount}.`);
                    return { ...loggedState, transactions: newTransactions, suspiciousTransactions: [newSuspicious, ...state.suspiciousTransactions] };
                }
            }

            // --- DEFAULT TRANSACTION ADDITION ---
            const newTransactions = [action.payload, ...state.transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const loggedState = addLog(state, `Adicionou a transação "${action.payload.description}" de R$${action.payload.amount}.`);
            return { ...loggedState, transactions: newTransactions };
        case 'OPEN_BILL_MODAL':
            return { ...state, isBillModalOpen: true };
        case 'CLOSE_BILL_MODAL':
            return { ...state, isBillModalOpen: false };
        case 'ADD_BILL':
            return { ...state, bills: [...state.bills, action.payload] };
        case 'UPDATE_BILL_STATUS':
            return { ...state, bills: state.bills.map(b => b.id === action.payload.id ? { ...b, status: action.payload.status } : b) };
        case 'OPEN_GOAL_MODAL':
            return { ...state, isGoalModalOpen: true };
        case 'CLOSE_GOAL_MODAL':
            return { ...state, isGoalModalOpen: false };
        case 'ADD_GOAL':
            return { ...state, goals: [...state.goals, action.payload] };
        case 'OPEN_CATEGORY_MODAL':
            return { ...state, isCategoryModalOpen: true };
        case 'CLOSE_CATEGORY_MODAL':
            return { ...state, isCategoryModalOpen: false };
        case 'ADD_CATEGORY':
            return { ...state, categories: [...state.categories, action.payload] };
        case 'OPEN_CHALLENGE_MODAL':
            return { ...state, isChallengeModalOpen: true };
        case 'CLOSE_CHALLENGE_MODAL':
            return { ...state, isChallengeModalOpen: false };
        case 'ADD_CHALLENGE':
            return { ...state, challenges: [...state.challenges, action.payload] };
        case 'OPEN_PREMIUM_UPSELL_MODAL':
            return { ...state, isPremiumUpsellModalOpen: true };
        case 'CLOSE_PREMIUM_UPSELL_MODAL':
            return { ...state, isPremiumUpsellModalOpen: false };
        case 'OPEN_MOBILE_MENU':
            return { ...state, isMobileMenuOpen: true };
        case 'CLOSE_MOBILE_MENU':
            return { ...state, isMobileMenuOpen: false };
        case 'SET_SUBSCRIPTION_PLAN':
            return { ...state, subscriptionPlan: action.payload };
        case 'SET_MONTHLY_BUDGET':
            return { ...state, monthlyBudget: action.payload };
        case 'SET_MIN_BALANCE_GOAL':
            return { ...state, minBalanceGoal: action.payload };
        case 'INVITE_MEMBER':
            const newMember: SharedAccountMember = { id: crypto.randomUUID(), name: action.payload.email.split('@')[0], email: action.payload.email, permission: action.payload.permission, isOnline: false };
            const stateAfterInvite = addLog(state, `Convidou ${newMember.email} para a conta.`);
            return { ...stateAfterInvite, sharedAccount: { ...stateAfterInvite.sharedAccount, members: [...stateAfterInvite.sharedAccount.members, newMember] } };
        case 'REMOVE_MEMBER':
             const memberToRemove = state.sharedAccount.members.find(m => m.id === action.payload.memberId);
             const stateAfterRemove = addLog(state, `Removeu ${memberToRemove?.name || 'um membro'} da conta.`);
            return { ...stateAfterRemove, sharedAccount: { ...stateAfterRemove.sharedAccount, members: stateAfterRemove.sharedAccount.members.filter(m => m.id !== action.payload.memberId) } };
        case 'UPDATE_MEMBER_PERMISSION':
             const memberToUpdate = state.sharedAccount.members.find(m => m.id === action.payload.memberId);
             const stateAfterPermUpdate = addLog(state, `Alterou a permissão de ${memberToUpdate?.name} para ${action.payload.permission}.`);
            return { ...stateAfterPermUpdate, sharedAccount: { ...stateAfterPermUpdate.sharedAccount, members: stateAfterPermUpdate.sharedAccount.members.map(m => m.id === action.payload.memberId ? { ...m, permission: action.payload.permission } : m) } };
        case 'SEND_CHAT_MESSAGE':
            return { ...state, sharedAccount: { ...state.sharedAccount, chat: [...state.sharedAccount.chat, action.payload] } };
        case 'EDIT_CHAT_MESSAGE':
             return { ...state, sharedAccount: { ...state.sharedAccount, chat: state.sharedAccount.chat.map(m => m.id === action.payload.messageId ? { ...m, text: action.payload.newText, isEdited: true } : m) } };
        case 'DELETE_CHAT_MESSAGE':
            return { ...state, sharedAccount: { ...state.sharedAccount, chat: state.sharedAccount.chat.filter(m => m.id !== action.payload.messageId) } };
        case 'PIN_CHAT_MESSAGE':
            return { ...state, sharedAccount: { ...state.sharedAccount, pinnedMessageId: action.payload.messageId } };
        case 'UNPIN_CHAT_MESSAGE':
            return { ...state, sharedAccount: { ...state.sharedAccount, pinnedMessageId: null } };

        // New Shared Account Reducers
        case 'UPDATE_SHARED_ACCOUNT_NAME':
            return addLog({ ...state, sharedAccount: { ...state.sharedAccount, name: action.payload } }, `Alterou o nome da conta para "${action.payload}".`);
        
        case 'UPDATE_MEMBER_PROFILE':
            const stateAfterProfileUpdate = addLog(state, `Atualizou o perfil de ${state.sharedAccount.members.find(m => m.id === action.payload.memberId)?.name}.`);
            return {
                ...stateAfterProfileUpdate,
                sharedAccount: {
                    ...stateAfterProfileUpdate.sharedAccount,
                    members: stateAfterProfileUpdate.sharedAccount.members.map(m => m.id === action.payload.memberId ? { ...m, nickname: action.payload.nickname, color: action.payload.color } : m)
                }
            };
        case 'ADD_SHARED_GOAL':
            const newSharedGoal: SharedGoal = { id: crypto.randomUUID(), name: action.payload.name, targetAmount: action.payload.targetAmount, currentAmount: 0, contributions: [] };
            const stateAfterGoalAdd = addLog(state, `Criou a meta compartilhada "${action.payload.name}".`);
            return { ...stateAfterGoalAdd, sharedAccount: { ...stateAfterGoalAdd.sharedAccount, goals: [...stateAfterGoalAdd.sharedAccount.goals, newSharedGoal] } };
        
        case 'CONTRIBUTE_TO_SHARED_GOAL':
             const stateAfterContribution = addLog(state, `Contribuiu R$${action.payload.amount} para a meta "${state.sharedAccount.goals.find(g => g.id === action.payload.goalId)?.name}".`);
            return {
                ...stateAfterContribution,
                sharedAccount: {
                    ...stateAfterContribution.sharedAccount,
                    goals: stateAfterContribution.sharedAccount.goals.map(g => g.id === action.payload.goalId ? {
                        ...g,
                        currentAmount: g.currentAmount + action.payload.amount,
                        contributions: [...g.contributions, { memberId: state.userId, amount: action.payload.amount }]
                    } : g)
                }
            };
        
        case 'ADD_POLL':
            const newPoll: Poll = { id: crypto.randomUUID(), question: action.payload.question, createdBy: state.userId, options: action.payload.options.map(o => ({ id: crypto.randomUUID(), text: o, votes: [] })), isOpen: true };
            const stateAfterPollAdd = addLog(state, `Criou a enquete "${action.payload.question}".`);
            return { ...stateAfterPollAdd, sharedAccount: { ...stateAfterPollAdd.sharedAccount, polls: [newPoll, ...stateAfterPollAdd.sharedAccount.polls] } };
        
        case 'VOTE_ON_POLL':
            const stateAfterVote = addLog(state, `Votou na enquete "${state.sharedAccount.polls.find(p => p.id === action.payload.pollId)?.question}".`);
            return {
                ...stateAfterVote,
                sharedAccount: {
                    ...stateAfterVote.sharedAccount,
                    polls: stateAfterVote.sharedAccount.polls.map(p => p.id === action.payload.pollId ? {
                        ...p,
                        options: p.options.map(o => ({
                            ...o,
                            // Remove previous vote from user, add new one
                            votes: o.votes.filter(v => v !== state.userId)
                        })).map(o => o.id === action.payload.optionId ? {
                            ...o,
                            votes: [...o.votes, state.userId]
                        } : o)
                    } : p)
                }
            };

        case 'ADD_AUTOMATION_RULE':
            const newRule: AutomationRule = { id: crypto.randomUUID(), ...action.payload };
            const stateAfterRuleAdd = addLog(state, `Criou a regra de automação "${action.payload.name}".`);
            return { ...stateAfterRuleAdd, sharedAccount: { ...stateAfterRuleAdd.sharedAccount, rules: [...stateAfterRuleAdd.sharedAccount.rules, newRule] } };
        
        case 'DELETE_AUTOMATION_RULE':
             const ruleToDelete = state.sharedAccount.rules.find(r => r.id === action.payload.ruleId);
             const stateAfterRuleDelete = addLog(state, `Removeu a regra de automação "${ruleToDelete?.name}".`);
            return { ...stateAfterRuleDelete, sharedAccount: { ...stateAfterRuleDelete.sharedAccount, rules: stateAfterRuleDelete.sharedAccount.rules.filter(r => r.id !== action.payload.ruleId) } };
        
        case 'OPEN_SCHEDULED_PAYMENT_MODAL':
            return { ...state, isScheduledPaymentModalOpen: true, scheduledPaymentToEdit: action.payload || null };
        case 'CLOSE_SCHEDULED_PAYMENT_MODAL':
            return { ...state, isScheduledPaymentModalOpen: false, scheduledPaymentToEdit: null };
        case 'ADD_SCHEDULED_PAYMENT':
            return { ...state, scheduledPayments: [...state.scheduledPayments, action.payload].sort((a,b) => {
                const monthA = a.paymentMonth || 0;
                const monthB = b.paymentMonth || 0;
                if (monthA !== monthB) return monthA - monthB;
                return a.paymentDay - b.paymentDay;
            }) };
        case 'UPDATE_SCHEDULED_PAYMENT':
            return { 
                ...state, 
                scheduledPayments: state.scheduledPayments.map(p => p.id === action.payload.id ? action.payload : p).sort((a,b) => {
                    const monthA = a.paymentMonth || 0;
                    const monthB = b.paymentMonth || 0;
                    if (monthA !== monthB) return monthA - monthB;
                    return a.paymentDay - b.paymentDay;
                }) 
            };
        case 'DELETE_SCHEDULED_PAYMENT':
            return { ...state, scheduledPayments: state.scheduledPayments.filter(p => p.id !== action.payload.id) };

        case 'SET_SUSPICIOUS_TRANSACTIONS':
            return { ...state, suspiciousTransactions: action.payload };
        case 'UPDATE_SUSPICIOUS_TRANSACTION_STATUS':
            return {
                ...state,
                suspiciousTransactions: state.suspiciousTransactions.map(t =>
                    t.id === action.payload.id ? { ...t, status: action.payload.status } : t
                )
            };
        
        case 'SHOW_TOAST':
            return { ...state, toastMessage: action.payload };
        case 'HIDE_TOAST':
            return { ...state, toastMessage: null };
        
        // Anti-Impulse Mode Reducers
        case 'TOGGLE_ANTI_IMPULSE_MODE':
            return { ...state, isAntiImpulseModeEnabled: !state.isAntiImpulseModeEnabled };
        case 'OPEN_IMPULSE_BLOCK_MODAL':
            return { ...state, isImpulseBlockModalOpen: true, blockedTransactionReview: action.payload };
        case 'CLOSE_IMPULSE_BLOCK_MODAL':
            return { ...state, isImpulseBlockModalOpen: false, blockedTransactionReview: null };
        case 'PROCESS_IMPULSE_BLOCK': {
            let updatedTransactions = state.transactions;
            const block = state.impulseBlocks.find(b => b.id === action.payload.blockId);
            if (action.payload.action === 'confirm' && block) {
                const newTransaction = { ...block.blockedTransaction, id: crypto.randomUUID() };
                updatedTransactions = [newTransaction, ...state.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            }
            return {
                ...state,
                transactions: updatedTransactions,
                impulseBlocks: state.impulseBlocks.map(b => 
                    b.id === action.payload.blockId ? { ...b, status: action.payload.action === 'confirm' ? 'confirmed' : 'deleted' } : b
                )
            };
        }


        default:
            return state;
    }
};

// --- PROVIDER & HOOK ---

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);