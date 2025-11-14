import { Transaction, Category, SuspiciousTransaction } from '../types';

const UNUSUAL_AMOUNT_THRESHOLD = 1.7; // 70% higher than average
const DUPLICATE_TIME_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const UNUSUAL_TIME_START_HOUR = 1; // 1 AM
const UNUSUAL_TIME_END_HOUR = 5; // 5 AM

const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

/**
 * Analyzes a new transaction to identify suspicious patterns.
 * @param newTransaction The transaction to be analyzed.
 * @param allTransactions A list of all user's transactions (including the new one).
 * @param categories A list of available categories.
 * @returns A SuspiciousTransaction object if a pattern is found, otherwise null.
 */
export const analyzeSuspiciousTransactions = (
    newTransaction: Transaction,
    allTransactions: Transaction[],
    categories: Category[]
): SuspiciousTransaction | null => {
    // We only analyze expenses for now
    if (newTransaction.type !== 'expense') {
        return null;
    }

    // 1. Check for Duplicate Transactions
    const potentialDuplicates = allTransactions.filter(t =>
        t.id !== newTransaction.id &&
        t.type === 'expense' &&
        t.amount === newTransaction.amount &&
        t.categoryId === newTransaction.categoryId &&
        Math.abs(new Date(t.date).getTime() - new Date(newTransaction.date).getTime()) < DUPLICATE_TIME_WINDOW_MS
    );

    if (potentialDuplicates.length > 0) {
        const timeDiffMinutes = Math.round(Math.abs(new Date(potentialDuplicates[0].date).getTime() - new Date(newTransaction.date).getTime()) / (1000 * 60));
        return {
            id: crypto.randomUUID(),
            transactionId: newTransaction.id,
            reason: 'duplicate',
            message: `Encontramos duas compras iguais (${formatCurrency(newTransaction.amount)}) feitas com ${timeDiffMinutes} minuto(s) de diferença. Deseja revisar?`,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
    }

    // 2. Check for Unusually Large Amounts
    const categoryTransactions = allTransactions.filter(t =>
        t.id !== newTransaction.id &&
        t.type === 'expense' &&
        t.categoryId === newTransaction.categoryId
    );

    if (categoryTransactions.length > 3) { // Need some history to calculate an average
        const categoryAverage = categoryTransactions.reduce((sum, t) => sum + t.amount, 0) / categoryTransactions.length;
        if (newTransaction.amount > categoryAverage * UNUSUAL_AMOUNT_THRESHOLD) {
            const percentageDiff = Math.round(((newTransaction.amount - categoryAverage) / categoryAverage) * 100);
            return {
                id: crypto.randomUUID(),
                transactionId: newTransaction.id,
                reason: 'unusual_amount',
                message: `Este valor de ${formatCurrency(newTransaction.amount)} é ${percentageDiff}% maior que seu gasto médio nesta categoria.`,
                status: 'pending',
                timestamp: new Date().toISOString()
            };
        }
    }

    // 3. Check for Unusual Times
    const transactionHour = new Date(newTransaction.date).getHours();
    if (transactionHour >= UNUSUAL_TIME_START_HOUR && transactionHour < UNUSUAL_TIME_END_HOUR) {
        return {
            id: crypto.randomUUID(),
            transactionId: newTransaction.id,
            reason: 'unusual_time',
            message: `Esta compra foi realizada em um horário atípico (${transactionHour}h). Deseja revisar?`,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
    }

    // 4. Check for potential new subscriptions (simplified)
    const similarTransactions = allTransactions.filter(t =>
        t.id !== newTransaction.id &&
        t.type === 'expense' &&
        t.description.toLowerCase() === newTransaction.description.toLowerCase()
    );
    if (similarTransactions.length >= 2) { // The new one is the 3rd or more
        return {
            id: crypto.randomUUID(),
            transactionId: newTransaction.id,
            reason: 'new_subscription',
            message: `Uma possível assinatura foi detectada: cobrança repetida para "${newTransaction.description}" nos últimos meses.`,
            status: 'pending',
            timestamp: new Date().toISOString()
        }
    }


    return null;
};
