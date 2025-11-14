// FIX: Removed a self-import which was causing "Import declaration conflicts with local declaration" errors.

export type Screen =
    | 'dashboard'
    | 'history'
    | 'categories'
    | 'goals'
    | 'challenges'
    | 'performance'
    | 'financial_health'
    | 'ai_advisor'
    | 'subscription'
    | 'shared_account'
    | 'scheduled_payments'
    | 'suspicious_transactions'
    | 'impulse_blocks';

export type TransactionType = 'income' | 'expense';

export type SubscriptionPlan = 'free' | 'premium';

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    description: string;
    categoryId: string;
    date: string; // ISO string format YYYY-MM-DD
    tags?: string[];
    split?: { memberId: string; amount: number; percentage: number }[];
    approvedBy?: string[]; // Member IDs who approved
    needsApproval?: boolean;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
}

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string; // ISO string format YYYY-MM-DD
}

export type ChallengeStatus = 'active' | 'completed' | 'failed';

export interface Challenge {
    id: string;
    name: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    durationDays: number;
    startDate: string; // ISO String
    status: ChallengeStatus;
    icon: string;
}

export type AlertLevel = 'success' | 'warning' | 'critical' | 'info';

export interface Alert {
    level: AlertLevel;
    title: string;
    message: string;
}

export type BillStatus = 'pending' | 'paid';

export interface Bill {
    id: string;
    name: string;
    amount: number;
    dueDate: string; // ISO string format YYYY-MM-DD
    categoryId?: string;
    status: BillStatus;
}

// --- Scheduled Payments PRO Feature ---
export type PaymentMethod = 'pix' | 'debit' | 'boleto' | 'credit';

export interface ScheduledPayment {
    id: string;
    name: string;
    amount: number;
    isVariable: boolean;
    paymentDay: number; // 1-31
    paymentMonth?: number; // 1-12, for annual payments
    paymentMethod: PaymentMethod;
    categoryId: string;
    isActive: boolean;
}


// --- Shared Account Types ---
export type PermissionLevel = 'admin' | 'editor' | 'readonly';

export interface SharedAccountMember {
    id: string;
    name: string;
    email: string;
    permission: PermissionLevel;
    isOnline: boolean;
    nickname?: string;
    color?: string;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: string; // ISO string
    isEdited: boolean;
}

export interface SharedGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    contributions: { memberId: string; amount: number }[];
}

export interface Poll {
    id: string;
    question: string;
    createdBy: string;
    options: { id: string; text: string; votes: string[] }[];
    isOpen: boolean;
}

export type AutomationRuleTrigger = 'new_transaction_category' | 'new_transaction_above_amount';
export type AutomationRuleAction = 'split_equally' | 'send_chat_notification';

export interface AutomationRule {
    id: string;
    name: string;
    trigger: AutomationRuleTrigger;
    triggerValue: any; // e.g., categoryId (string) or amount (number)
    action: AutomationRuleAction;
}

export interface AuditLog {
    id: string;
    timestamp: string; // ISO string
    memberId: string;
    memberName: string;
    action: string; // e.g., "Created transaction 'Groceries'"
}

export interface SharedAccount {
    id: string;
    name: string;
    members: SharedAccountMember[];
    chat: ChatMessage[];
    pinnedMessageId: string | null;
    goals: SharedGoal[];
    polls: Poll[];
    rules: AutomationRule[];
    logs: AuditLog[];
}

// --- Suspicious Transaction Analysis Types ---
export type SuspiciousReason = 'unusual_amount' | 'duplicate' | 'unusual_time' | 'new_subscription';
export type SuspiciousTransactionStatus = 'pending' | 'confirmed' | 'ignored';

export interface SuspiciousTransaction {
    id: string;
    transactionId: string;
    reason: SuspiciousReason;
    message: string;
    status: SuspiciousTransactionStatus;
    timestamp: string; // ISO string
}

// --- Anti-Impulse Mode Types ---
export type ImpulseRiskLevel = 'baixo' | 'médio' | 'alto' | 'crítico';
export type ImpulseBlockReason = 'rapid_purchases' | 'repeated_purchase' | 'risky_time';
export type ImpulseBlockStatus = 'pending' | 'confirmed' | 'deleted';

export interface ImpulseBlock {
    id: string;
    blockedTransaction: Omit<Transaction, 'id'>;
    reason: ImpulseBlockReason;
    message: string;
    riskLevel: ImpulseRiskLevel;
    timestamp: string; // ISO string
    status: ImpulseBlockStatus;
}