import type { BankMovement, BankMovementInput } from '../interfaces/bankMovement';
import { getToken } from '../auth/auth';
import { API_HOST } from './config';

const API_URL = `${API_HOST}/movimientos-banco`;

export async function listBankMovements(year: number, quarter: number): Promise<BankMovement[]> {
    const token = getToken();
    const res = await fetch(`${API_URL}?year=${year}&quarter=${quarter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    return res.json();
}

export async function createBankMovement(data: BankMovementInput): Promise<void> {
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

export async function updateBankMovement(id: number, data: BankMovementInput): Promise<void> {
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

export async function deleteBankMovement(id: number): Promise<void> {
    const token = getToken();
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
}
