import type { Invoice } from '../interfaces/invoice';
import { getToken } from '../auth/auth';
import { API_HOST } from './config';

const API_URL = `${API_HOST}/factura`;

export async function listInvoices(year: number, quarter: number): Promise<Invoice[]> {
    const token = getToken();
    const response = await fetch(`${API_URL}/list?year=${year}&quarter=${quarter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
    return response.json();
}

export async function viewInvoicePdf(confirmationNumber: string): Promise<Blob> {
    const token = getToken();
    const response = await fetch(`${API_URL}/${confirmationNumber}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
    return response.blob();
}

export async function resendInvoice(confirmationNumber: string): Promise<void> {
    const token = getToken();
    const response = await fetch(`${API_URL}/${confirmationNumber}/resend`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
}
