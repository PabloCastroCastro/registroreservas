import type { SupplierInvoice, SupplierInvoiceInput, PendingSupplierEmail } from '../interfaces/supplierInvoice';
import { getToken } from '../auth/auth';
import { API_HOST } from './config';

const API_URL = `${API_HOST}/factura/proveedor`;

export async function listSupplierInvoices(year: number, quarter: number): Promise<SupplierInvoice[]> {
    const token = getToken();
    const res = await fetch(`${API_URL}?year=${year}&quarter=${quarter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    return res.json();
}

export async function createSupplierInvoice(data: SupplierInvoiceInput): Promise<void> {
    const token = getToken();
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Error HTTP ${res.status}`);
    }
}

export async function updateSupplierInvoice(id: number, data: SupplierInvoiceInput): Promise<void> {
    const token = getToken();
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Error HTTP ${res.status}`);
    }
}

export async function deleteSupplierInvoice(id: number): Promise<void> {
    const token = getToken();
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
}

export async function getPendingSupplierEmails(): Promise<PendingSupplierEmail[]> {
    const token = getToken();
    const res = await fetch(`${API_URL}/email-pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Error HTTP ${res.status}`);
    }
    return res.json();
}
