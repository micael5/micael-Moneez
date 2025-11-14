import { Bill } from '../types';

// Helper to format date for ICS (YYYYMMDDTHHMMSS)
const formatDateICS = (dateStr: string): string => {
    return dateStr.replace(/-/g, '');
};


/**
 * Generates the string content for an .ics (iCalendar) file based on a bill.
 * Creates a 1-hour event on the due date with multiple alerts.
 * @param bill The bill to create an event for.
 * @returns A string formatted as an iCalendar event.
 */
const generateICSContent = (bill: Bill): string => {
    const eventDate = formatDateICS(bill.dueDate);
    const startDate = `${eventDate}T090000`; // Event starts at 9:00 AM on the due date
    const endDate = `${eventDate}T100000`;   // Event ends at 10:00 AM on the due date
    
    // ISO 8601 format for timestamp, e.g., 20240725T120000Z
    const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

    const content = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//MONEEZ//App Financeiro//PT',
        'BEGIN:VEVENT',
        `UID:${bill.id}@moneez.app`,
        `DTSTAMP:${now}`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:Vencimento: ${bill.name}`,
        `DESCRIPTION:Valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bill.amount)}\\n\\nLembrete gerado por MONEEZ.`,
        // Alarm 2 days before
        'BEGIN:VALARM',
        'TRIGGER:-P2D',
        'ACTION:DISPLAY',
        `DESCRIPTION:Lembrete de Vencimento: ${bill.name}`,
        'END:VALARM',
        // Alarm 1 day before
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        `DESCRIPTION:Lembrete de Vencimento: ${bill.name}`,
        'END:VALARM',
        // Alarm on the day, 10 minutes before the event (at 8:50 AM)
        'BEGIN:VALARM',
        'TRIGGER:-PT10M',
        'ACTION:DISPLAY',
        `DESCRIPTION:Vencimento Hoje: ${bill.name}`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n'); // Use CRLF line endings for compatibility

    return content;
};

/**
 * Triggers a browser download for an .ics file generated from a bill.
 * @param bill The bill to sync to the calendar.
 */
export const syncBillToCalendar = (bill: Bill) => {
    const icsContent = generateICSContent(bill);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    // Sanitize file name
    const fileName = `MONEEZ_${bill.name.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    link.setAttribute('download', fileName);
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
