import { Transaction, ImpulseBlock } from '../types';

const RAPID_PURCHASE_COUNT = 3;
const RAPID_PURCHASE_WINDOW_MINUTES = 4;
const REPEATED_PURCHASE_WINDOW_MINUTES = 2;
const RISKY_TIME_START_HOUR = 23; // 11 PM
const RISKY_TIME_END_HOUR = 5;    // 5 AM

const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

/**
 * Analyzes a new expense transaction to identify impulsive spending patterns.
 * @param newTransaction The expense transaction to be analyzed.
 * @param allTransactions A list of all user's transactions (excluding the new one).
 * @returns An ImpulseBlock object if a pattern is found, otherwise null.
 */
export const analyzeImpulsiveSpending = (
    newTransaction: Omit<Transaction, 'id'>,
    allTransactions: Transaction[]
): ImpulseBlock | null => {
    const now = new Date();

    // 1. Check for Risky Times
    const transactionHour = new Date(newTransaction.date).getHours();
    if (transactionHour >= RISKY_TIME_START_HOUR || transactionHour < RISKY_TIME_END_HOUR) {
        return {
            id: crypto.randomUUID(),
            blockedTransaction: newTransaction,
            reason: 'risky_time',
            message: `Você quase nunca gasta neste horário (${transactionHour}h). Tem certeza de que esta compra é essencial agora?`,
            riskLevel: 'médio',
            timestamp: now.toISOString(),
            status: 'pending',
        };
    }
    
    // 2. Check for Repeated Purchase
    const lastTransaction = allTransactions[0];
    if (lastTransaction) {
        const timeDiffMinutes = (now.getTime() - new Date(lastTransaction.date).getTime()) / (1000 * 60);
        if (
            lastTransaction.type === 'expense' &&
            lastTransaction.amount === newTransaction.amount &&
            lastTransaction.categoryId === newTransaction.categoryId &&
            timeDiffMinutes < REPEATED_PURCHASE_WINDOW_MINUTES
        ) {
            return {
                id: crypto.randomUUID(),
                blockedTransaction: newTransaction,
                reason: 'repeated_purchase',
                message: `Esta compra de ${formatCurrency(newTransaction.amount)} é idêntica à anterior. Deseja mesmo confirmar este gasto?`,
                riskLevel: 'alto',
                timestamp: now.toISOString(),
                status: 'pending',
            };
        }
    }

    // 3. Check for Rapid Purchases
    const recentTransactions = allTransactions.filter(t => t.type === 'expense');
    if (recentTransactions.length >= RAPID_PURCHASE_COUNT -1) {
        const windowStartTime = new Date(now.getTime() - RAPID_PURCHASE_WINDOW_MINUTES * 60 * 1000);
        const purchasesInWindow = recentTransactions.filter(t => new Date(t.date) > windowStartTime);

        if (purchasesInWindow.length >= RAPID_PURCHASE_COUNT -1) {
            return {
                id: crypto.randomUUID(),
                blockedTransaction: newTransaction,
                reason: 'rapid_purchases',
                message: `Bloqueei este gasto de ${formatCurrency(newTransaction.amount)}, pois detectei um padrão de compras por impulso (${RAPID_PURCHASE_COUNT} gastos em menos de ${RAPID_PURCHASE_WINDOW_MINUTES} minutos).`,
                riskLevel: 'crítico',
                timestamp: now.toISOString(),
                status: 'pending',
            };
        }
    }
    
    return null;
};
