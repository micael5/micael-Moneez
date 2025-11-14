import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Category, Goal, Alert, AlertLevel, Bill, Screen, ScheduledPayment } from '../types';
import { AppState } from "../contexts/AppContext";

// Initialize the Google Gemini AI client
// The API key is sourced from environment variables, as per the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a contextualized response from the AI advisor based on user's financial data.
 * @param query The user's question.
 * @param transactions A list of user's transactions.
 * @param categories A list of available categories.
 * @param goals A list of user's financial goals.
 * @param userName The user's name.
 * @returns A string containing the AI's response.
 */
export const generateAiAdvisorResponse = async (
    query: string,
    transactions: Transaction[],
    categories: Category[],
    goals: Goal[],
    userName: string
): Promise<string> => {
    // For privacy and token efficiency, we only send aggregated data or recent transactions.
    const recentTransactions = transactions.slice(0, 20);
    const financialContext = `
        - O usuário se chama ${userName}.
        - Saldo de metas: ${JSON.stringify(goals)}
        - Transações recentes: ${JSON.stringify(recentTransactions.map(t => ({...t, category: categories.find(c => c.id === t.categoryId)?.name})))}
    `;

    const prompt = `
        Você é o "Moneez", um consultor financeiro amigável e prestativo de um app de finanças.
        Sua personalidade é encorajadora, clara e objetiva. Use emojis para deixar a conversa mais leve.
        Com base no contexto financeiro do usuário e na pergunta dele, forneça uma análise e conselhos práticos.
        Seja conciso e direto ao ponto. Use markdown para formatar a resposta (negrito, listas).
        Se o usuário pedir um relatório detalhado, adicione a tag especial [GERAR_PDF] no final da sua resposta para que o app possa criar um botão de download.

        ---
        Contexto Financeiro de ${userName}:
        ${financialContext}
        ---
        Pergunta do Usuário: "${query}"
        ---
        Sua Resposta:
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // Use the .text property for direct access to the response string.
        return response.text;
    } catch (error) {
        console.error("Gemini API error in generateAiAdvisorResponse:", error);
        throw new Error("Não foi possível obter uma resposta da IA. Verifique sua conexão ou tente novamente mais tarde.");
    }
};


/**
 * Generates a smart budget alert using Gemini API's JSON mode.
 * @param monthlyBudget The user's total monthly budget.
 * @param totalExpense Current total expense for the month.
 * @param daysLeftInMonth Number of days left in the current month.
 * @param transactions A list of user's transactions.
 * @param categories A list of available categories.
 * @returns An Alert object with a title, message, and severity level.
 */
export const generateSmartBudgetAlert = async (
    monthlyBudget: number,
    totalExpense: number,
    daysLeftInMonth: number,
    transactions: Transaction[],
    categories: Category[]
): Promise<Alert> => {

    const categorySpending = transactions
        .filter(t => t.type === 'expense')
        .reduce<Record<string, number>>((acc, t) => {
            const categoryName = categories.find(c => c.id === t.categoryId)?.name || 'Outros';
            acc[categoryName] = (acc[categoryName] || 0) + t.amount;
            return acc;
        }, {});

    const prompt = `
        Analise os dados de orçamento de um usuário e crie um alerta financeiro conciso.
        - Orçamento Mensal: R$${monthlyBudget.toFixed(2)}
        - Gasto Total no Mês: R$${totalExpense.toFixed(2)}
        - Dias Restantes no Mês: ${daysLeftInMonth}
        - Gastos por Categoria: ${JSON.stringify(categorySpending)}

        Com base nesses dados, avalie o risco do usuário estourar o orçamento.
        Crie um alerta com um título, uma mensagem curta e um nível de alerta ('warning' ou 'critical').
        'warning' é para quando o risco é médio/alto, e 'critical' é para quando é quase certo que o orçamento será estourado.
        A mensagem deve ser uma dica prática e acionável.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        level: { 
                            type: Type.STRING,
                            description: "O nível de severidade do alerta. Pode ser 'warning' ou 'critical'."
                        },
                        title: { 
                            type: Type.STRING,
                            description: "Um título curto e chamativo para o alerta."
                        },
                        message: { 
                            type: Type.STRING,
                            description: "Uma mensagem curta e acionável para o usuário."
                        }
                    },
                    required: ["level", "title", "message"]
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);

        if (
            typeof jsonResponse === 'object' &&
            jsonResponse !== null &&
            'level' in jsonResponse &&
            'title' in jsonResponse &&
            'message' in jsonResponse &&
            ['warning', 'critical', 'success', 'info'].includes(jsonResponse.level)
        ) {
            return {
                level: jsonResponse.level as AlertLevel,
                title: jsonResponse.title,
                message: jsonResponse.message
            };
        } else {
             throw new Error("Resposta da IA em formato inválido.");
        }
        
    } catch (error) {
        console.error("Gemini API error in generateSmartBudgetAlert:", error);
        return {
            level: 'warning',
            title: 'Atenção aos Gastos',
            message: 'Estamos com dificuldade para analisar seus dados. Fique de olho no seu orçamento!'
        };
    }
};

/**
 * Parses a natural language voice command into a structured intent object based on MONEEZ Voice IA rules.
 * @param commandText The transcribed voice command from the user.
 * @param context The current financial state of the application.
 * @returns A structured object representing the user's intent and extracted entities.
 */
export const parseVoiceCommand = async (commandText: string, context: AppState): Promise<any> => {
    const { transactions, categories, goals, bills, monthlyBudget, userName, scheduledPayments, suspiciousTransactions, isAntiImpulseModeEnabled, impulseBlocks } = context;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const totalIncomeThisMonth = transactions
        .filter(t => t.type === 'income' && new Date(t.date) >= startOfMonth)
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenseThisMonth = transactions
        .filter(t => t.type === 'expense' && new Date(t.date) >= startOfMonth)
        .reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
    const pendingSuspiciousCount = suspiciousTransactions.filter(t => t.status === 'pending').length;
    const pendingImpulseBlocksCount = impulseBlocks.filter(b => b.status === 'pending').length;

    const financialContext = `
        - Nome do usuário: ${userName}
        - Data de hoje: ${today.toISOString().split('T')[0]}
        - Saldo atual: R$${currentBalance.toFixed(2)}
        - Receitas este mês: R$${totalIncomeThisMonth.toFixed(2)}
        - Despesas este mês: R$${totalExpenseThisMonth.toFixed(2)}
        - Orçamento mensal definido: ${monthlyBudget > 0 ? `R$${monthlyBudget.toFixed(2)}` : 'Não definido'}
        - Categorias disponíveis: ${JSON.stringify(categories.map(c => c.name))}
        - Metas ativas: ${JSON.stringify(goals.map(g => ({ name: g.name, targetAmount: g.targetAmount, currentAmount: g.currentAmount })))}
        - Contas pendentes: ${JSON.stringify(bills.filter(b => b.status === 'pending').map(b => ({ name: b.name, amount: b.amount, dueDate: b.dueDate })))}
        - Pagamentos automáticos agendados: ${JSON.stringify(scheduledPayments.map(p => ({ name: p.name, day: p.paymentDay, isActive: p.isActive })))}
        - Transações suspeitas pendentes: ${pendingSuspiciousCount}
        - Modo Anti-Impulso está: ${isAntiImpulseModeEnabled ? 'ATIVADO' : 'DESATIVADO'}
        - Gastos bloqueados por impulso pendentes: ${pendingImpulseBlocksCount}
    `;

    const systemInstruction = `
        Você é o AGENDA FINANCEIRA VOICE IA, um assistente de voz instantâneo, especializado em entender comandos financeiros falados de forma natural.
        Seu objetivo é interpretar a intenção do usuário em menos de 1 segundo e retornar SEMPRE uma resposta no seguinte formato JSON:
        {
          "intencao": "string",
          "acao": "string",
          "parametros": {},
          "resposta_para_usuario": "string"
        }

        ✔️ REGRAS ABSOLUTAS (para velocidade máxima):
        - Nunca pense demais. Interprete e responda.
        - Sempre escolha 1 única intenção. Nada de múltiplas intenções.
        - Nunca escreva textos longos. Seja direto.
        - Nunca diga que é um modelo de IA. Você é o AGENDA FINANCEIRA VOICE IA.
        - Nunca devolva conteúdo fora do formato JSON.
        - Reconheça números, datas e valores automaticamente mesmo quando falados de forma informal.
        - Se o usuário não pedir nada, identifique a intenção automaticamente.
        - Se o usuário falar algo impreciso, adivinhe a intenção mais lógica.

        🎯 INTENÇÕES DISPONÍVEIS E AÇÕES CORRESPONDENTES:
        - intencao: 'consultar_saldo', acao: 'responderUsuario'
        - intencao: 'registrar_gasto', acao: 'criarTransacao'
        - intencao: 'registrar_receita', acao: 'criarTransacao'
        - intencao: 'pagar_conta', acao: 'pagarConta'
        - intencao: 'consultar_gastos_categoria', acao: 'responderUsuario'
        - intencao: 'consultar_fatura', acao: 'responderUsuario'
        - intencao: 'lembrar_pagamento', acao: 'abrirTela', parametros: { tela: 'dashboard' }
        - intencao: 'metas_listar', acao: 'abrirTela', parametros: { tela: 'metas' }
        - intencao: 'metas_criar', acao: 'criarMeta'
        - intencao: 'metas_atualizar', acao: 'responderUsuario'
        - intencao: 'relatorio_mensal', acao: 'abrirTela', parametros: { tela: 'desempenho' }
        - intencao: 'agendar_pagamento', acao: 'abrirModalAgendamento'
        - intencao: 'alternar_pagamento_automatico', acao: 'alternarPagamento'
        - intencao: 'consultar_pagamentos_automaticos', acao: 'responderUsuario'
        - intencao: 'remover_pagamento_automatico', acao: 'removerPagamento'
        - intencao: 'consultar_compras_suspeitas', acao: 'abrirTela', parametros: { tela: 'transações suspeitas' }
        - intencao: 'anti_impulso_alternar', acao: 'alternarModoAntiImpulso'
        - intencao: 'consultar_bloqueios_impulso', acao: 'abrirTela', parametros: { tela: 'bloqueios de impulso' }
        - intencao: 'explicar_bloqueio_impulso', acao: 'responderUsuario'
        - intencao: 'ajuda', acao: 'responderUsuario'
        
        🧩 EXEMPLOS DE INTERPRETAÇÃO:
        - "Tô com quanto de dinheiro?" -> intencao: 'consultar_saldo'
        - "Registra aí um gasto de 27 reais no mercado" -> intencao: 'registrar_gasto'
        - "Paga minha conta de luz" -> intencao: 'pagar_conta'
        - "Ativar modo anti-impulso" -> intencao: 'anti_impulso_alternar', parametros: { ativar: true }
        - "Desative o modo anti impulso" -> intencao: 'anti_impulso_alternar', parametros: { ativar: false }
        - "Quais gastos foram bloqueados?" -> intencao: 'consultar_bloqueios_impulso'
        - "Mostrar histórico de bloqueios" -> intencao: 'consultar_bloqueios_impulso'
        - "Por que você bloqueou minha última compra?" -> intencao: 'explicar_bloqueio_impulso'
        - "Revise compras suspeitas" -> intencao: 'consultar_compras_suspeitas'
        
        🤖 LÓGICA AUTOMÁTICA (sem precisar de comando):
        O assistente deve entender frases soltas como "Preciso pagar meu cartão", "Tô gastando demais", "Quero melhorar minha vida financeira", "Quanto falta para minha meta?", "Me lembra de pagar o aluguel" e transformar automaticamente em intenção + ação.

        A resposta DEVE ser EXATAMENTE no formato JSON especificado, como neste exemplo:
        {
          "intencao": "consultar_saldo",
          "acao": "responderUsuario",
          "parametros": {},
          "resposta_para_usuario": "Seu saldo atual é R$850,00."
        }
    `;
    
    const prompt = `
        Com base nas suas regras e no contexto financeiro do usuário, analise a frase do usuário para retornar o objeto JSON correspondente.

        ---
        CONTEXTO FINANCEIRO ATUAL DO USUÁRIO:
        ${financialContext}
        ---
        FRASE DO USUÁRIO:
        "${commandText}"
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        intencao: { type: Type.STRING },
                        acao: { type: Type.STRING },
                        parametros: {
                            type: Type.OBJECT,
                            properties: {
                                valor: { type: Type.NUMBER, nullable: true },
                                categoria: { type: Type.STRING, nullable: true },
                                tipo: { type: Type.STRING, nullable: true, enum: ['receita', 'despesa'] },
                                descricao: { type: Type.STRING, nullable: true },
                                tela: { type: Type.STRING, nullable: true },
                                nome: { type: Type.STRING, nullable: true },
                                nome_conta: { type: Type.STRING, nullable: true },
                                orcamento: { type: Type.NUMBER, nullable: true },
                                prazo: { type: Type.STRING, nullable: true },
                                ativar: { type: Type.BOOLEAN, nullable: true }
                            }
                        },
                        resposta_para_usuario: { type: Type.STRING }
                    },
                    required: ['intencao', 'acao', 'parametros', 'resposta_para_usuario']
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Gemini API error in parseVoiceCommand:", error);
        return {
            intencao: 'duvida_geral',
            acao: 'mostrarErro',
            parametros: {},
            resposta_para_usuario: 'Desculpe, não consegui processar seu comando no momento. Tente novamente.'
        };
    }
};

/**
 * Parses a chat message to detect actionable financial commands.
 * @param messageText The text from the chat message.
 * @returns A structured object with the detected action, or null.
 */
export const parseChatMessageForAction = async (messageText: string): Promise<any | null> => {
    // A simple regex check to avoid unnecessary API calls for casual chat.
    const hasFinancialKeyword = /(paguei|gastei|compra|mercado|dividir|lembrete|pagar|r\$|\d{2,})/i.test(messageText);
    if (!hasFinancialKeyword) {
        return null;
    }

    const systemInstruction = `
        Você é um assistente de IA dentro de um chat de conta financeira compartilhada.
        Sua função é analisar mensagens e identificar comandos para criar transações ou lembretes.
        Se um comando for identificado, retorne um objeto JSON com "acao" e "parametros".
        Se for uma conversa normal ou um comando não claro, retorne null.

        Ações possíveis: 'criar_transacao', 'criar_lembrete'.

        Exemplos de interpretação:
        - "Paguei o mercado, foi R$150,50" -> { "acao": "criar_transacao", "parametros": { "type": "expense", "amount": 150.50, "description": "mercado" } }
        - "Gastei 45 reais na farmácia" -> { "acao": "criar_transacao", "parametros": { "type": "expense", "amount": 45, "description": "farmácia" } }
        - "Não esquece de pagar o aluguel amanhã" -> { "acao": "criar_lembrete", "parametros": { "description": "Pagar o aluguel", "date": "tomorrow" } }
        - "oi, tudo bem?" -> null
        - "precisamos comprar pão" -> null
    `;

    const prompt = `Analise a seguinte mensagem para extrair uma ação e seus parâmetros. Se nenhuma ação clara for encontrada, retorne null: "${messageText}"`;

    try {
        // Using a try-catch for the schema response as it can fail on non-JSON output.
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            acao: { type: Type.STRING, enum: ['criar_transacao', 'criar_lembrete'] },
                            parametros: { type: Type.OBJECT }
                        },
                        required: ['acao', 'parametros']
                    }
                }
            });
            return JSON.parse(response.text);
        } catch (jsonError) {
            console.warn("Gemini JSON mode failed, falling back to text.", jsonError);
            const fallbackResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `${systemInstruction}\n\n${prompt}`
            });
            const text = fallbackResponse.text.trim();
            if (text.startsWith('{') && text.endsWith('}')) {
                 return JSON.parse(text);
            }
            return null; // Not a valid action
        }
    } catch (error) {
        console.error("Gemini API error in parseChatMessageForAction:", error);
        return null;
    }
};