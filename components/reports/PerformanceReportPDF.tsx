import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Transaction, Category } from '../../types';

// Register fonts
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa.ttf', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa.ttf', fontWeight: 700 },
    ],
});

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Inter',
        padding: 40,
        backgroundColor: '#ffffff',
        color: '#1f2937',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#4f46e5',
        textAlign: 'center',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 4,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f9fafb',
        borderRadius: 5,
    },
    summaryBox: {
        textAlign: 'center',
    },
    summaryLabel: {
        fontSize: 10,
        color: '#6b7280',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'semibold',
    },
    table: {
        display: "flex",
        width: "auto",
        borderStyle: "solid",
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderColor: '#e5e7eb',
    },
    tableRow: {
        margin: "auto",
        flexDirection: "row"
    },
    tableColHeader: {
        width: "25%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#f3f4f6',
        padding: 5,
    },
    tableCol: {
        width: "25%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 5,
    },
    tableCellHeader: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    tableCell: {
        fontSize: 9,
    },
    textIncome: {
        color: '#10b981',
    },
    textExpense: {
        color: '#ef4444',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: '#9ca3af',
    }
});

interface PerformanceReportPDFProps {
    userName: string;
    transactions: Transaction[];
    categories: Category[];
}

const PerformanceReportPDF: React.FC<PerformanceReportPDFProps> = ({ userName, transactions, categories }) => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'N/A';
    const formatCurrency = (amount: number) => `R$ ${amount.toFixed(2).replace('.', ',')}`;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>Relatório de Desempenho Financeiro</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resumo Geral</Text>
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryBox}>
                            <Text style={styles.summaryLabel}>Receita Total</Text>
                            <Text style={[styles.summaryValue, styles.textIncome]}>{formatCurrency(totalIncome)}</Text>
                        </View>
                        <View style={styles.summaryBox}>
                            <Text style={styles.summaryLabel}>Despesa Total</Text>
                            <Text style={[styles.summaryValue, styles.textExpense]}>{formatCurrency(totalExpense)}</Text>
                        </View>
                        <View style={styles.summaryBox}>
                            <Text style={styles.summaryLabel}>Saldo Final</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(balance)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Últimas Transações</Text>
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={styles.tableRow}>
                            <View style={[styles.tableColHeader, {width: '20%'}]}><Text style={styles.tableCellHeader}>Data</Text></View>
                            <View style={[styles.tableColHeader, {width: '35%'}]}><Text style={styles.tableCellHeader}>Descrição</Text></View>
                            <View style={[styles.tableColHeader, {width: '20%'}]}><Text style={styles.tableCellHeader}>Categoria</Text></View>
                            <View style={[styles.tableColHeader, {width: '25%'}]}><Text style={styles.tableCellHeader}>Valor</Text></View>
                        </View>
                        {/* Table Body */}
                        {transactions.slice(0, 20).map(t => (
                            <View key={t.id} style={styles.tableRow}>
                                <View style={[styles.tableCol, {width: '20%'}]}><Text style={styles.tableCell}>{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Text></View>
                                <View style={[styles.tableCol, {width: '35%'}]}><Text style={styles.tableCell}>{t.description}</Text></View>
                                <View style={[styles.tableCol, {width: '20%'}]}><Text style={styles.tableCell}>{getCategoryName(t.categoryId)}</Text></View>
                                <View style={[styles.tableCol, {width: '25%'}]}>
                                    <Text style={[styles.tableCell, t.type === 'income' ? styles.textIncome : styles.textExpense]}>
                                        {formatCurrency(t.amount)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <Text style={styles.footer}>Relatório gerado por MONEEZ para {userName} em {new Date().toLocaleDateString('pt-BR')}.</Text>
            </Page>
        </Document>
    );
};

export default PerformanceReportPDF;
