import type { SupplierInvoice, SupplierInvoiceInput, PendingSupplierEmail, ExtractedInvoiceData } from '../interfaces/supplierInvoice';
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

function toFormData(data: SupplierInvoiceInput): FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (key === 'file') {
            if (value) formData.append('file', value as File);
        } else if (key === 'vatLines') {
            formData.append('vatLines', JSON.stringify(value ?? []));
        } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
        }
    });
    return formData;
}

export async function createSupplierInvoice(data: SupplierInvoiceInput): Promise<void> {
    const token = getToken();
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: toFormData(data)
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
        headers: { 'Authorization': `Bearer ${token}` },
        body: toFormData(data)
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

export async function viewSupplierInvoiceFile(id: number): Promise<Blob> {
    const token = getToken();
    const res = await fetch(`${API_URL}/${id}/file`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    return res.blob();
}

export async function viewPendingEmailAttachment(uid: number): Promise<Blob> {
    const token = getToken();
    const res = await fetch(`${API_URL}/email-pending/${uid}/attachment`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    return res.blob();
}

export async function extractPendingEmailInvoiceData(uid: number, supplierId: number): Promise<ExtractedInvoiceData> {
    const token = getToken();
    const res = await fetch(`${API_URL}/email-pending/${uid}/extract?supplierId=${supplierId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Error HTTP ${res.status}`);
    }
    return res.json();
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
