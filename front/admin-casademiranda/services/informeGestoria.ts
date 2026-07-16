import type { InformeGestoria } from '../interfaces/informeGestoria';
import { getToken } from '../auth/auth';
import { API_HOST } from './config';

const API_URL = `${API_HOST}/factura/informe`;

export async function getInformeGestoria(year: number, quarter: number): Promise<InformeGestoria> {
    const token = getToken();
    const res = await fetch(`${API_URL}?year=${year}&quarter=${quarter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    return res.json();
}

export async function downloadInformeExcel(year: number, quarter: number): Promise<Blob> {
    const token = getToken();
    const res = await fetch(`${API_URL}/excel?year=${year}&quarter=${quarter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    return res.blob();
}
