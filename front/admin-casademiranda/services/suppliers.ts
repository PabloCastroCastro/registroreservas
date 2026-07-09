import type { Supplier } from '../interfaces/supplier';
import { getToken } from '../auth/auth';
import { API_HOST } from './config';

const API_URL = `${API_HOST}/proveedores`;

export async function listSuppliers(): Promise<Supplier[]> {
    const token = getToken();
    const res = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    return res.json();
}

export async function createSupplier(name: string, domain: string, subjectKeyword: string | null): Promise<void> {
    const token = getToken();
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, domain, subjectKeyword })
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Error HTTP ${res.status}`);
    }
}

export async function updateSupplier(id: number, name: string, domain: string, subjectKeyword: string | null): Promise<void> {
    const token = getToken();
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, domain, subjectKeyword })
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Error HTTP ${res.status}`);
    }
}

export async function deleteSupplier(id: number): Promise<void> {
    const token = getToken();
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
}
