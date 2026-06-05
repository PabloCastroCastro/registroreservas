import type { User } from '../interfaces/user'
import { getToken } from '../auth/auth';
import { API_HOST } from './config';

const API_URL = `${API_HOST}/loginuser`;

export async function login(user: User) {
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        };
        const response = await fetch(`${API_URL}`, requestOptions);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

export interface ManagedUser {
    id: number;
    username: string;
    role: 'admin' | 'manager';
}

export async function getUsers(): Promise<ManagedUser[]> {
    const token = getToken();
    const res = await fetch(`${API_HOST}/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export async function createManagedUser(username: string, password: string, role: 'admin' | 'manager'): Promise<void> {
    const token = getToken();
    const res = await fetch(`${API_HOST}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ username, password, role })
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? `HTTP ${res.status}`);
    }
}

export async function changePassword(id: number, password: string): Promise<void> {
    const token = getToken();
    const res = await fetch(`${API_HOST}/usuarios/${id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ password })
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? `HTTP ${res.status}`);
    }
}

export async function deleteManagedUser(id: number): Promise<void> {
    const token = getToken();
    const res = await fetch(`${API_HOST}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
}