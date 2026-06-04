import type { BasePricesResponse } from '../interfaces/roomPrice';
import { getToken } from '../auth/auth';
import { API_HOST } from './config';

const API_URL = `${API_HOST}/precios-base`;

function headers() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
}

export async function getBasePrices(): Promise<BasePricesResponse> {
    const res = await fetch(API_URL, { headers: headers() });
    return res.json();
}

export async function updateBasePrice(id: number, price: number, priceExtraBed: number): Promise<void> {
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ price, price_extra_bed: priceExtraBed }),
    });
}

export async function updateSeasonConfig(highSeasonStart: string, highSeasonEnd: string): Promise<void> {
    await fetch(`${API_URL}/season-config`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ high_season_start: highSeasonStart, high_season_end: highSeasonEnd }),
    });
}

export async function getPriceForRoom(room: string, date: string): Promise<{ price: number; priceExtraBed: number; season: string } | null> {
    const res = await fetch(`${API_URL}/precio?room=${encodeURIComponent(room)}&date=${date}`, { headers: headers() });
    if (!res.ok) return null;
    const data = await res.json();
    return { price: data.price, priceExtraBed: data.priceExtraBed, season: data.season };
}
