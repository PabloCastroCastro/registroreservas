import type { Dish, RequestDish } from '../interfaces/menu';
import { getToken } from '../auth/auth';
import { API_HOST } from './config';

const API_URL = `${API_HOST}/menu`;

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
}

export async function getDishes(): Promise<Dish[]> {
  const res = await fetch(API_URL, { headers: authHeaders() });
  return res.json();
}

export async function createDish(dish: RequestDish): Promise<void> {
  await fetch(API_URL, { method: 'POST', headers: authHeaders(), body: JSON.stringify(dish) });
}

export async function updateDish(id: number, dish: RequestDish): Promise<void> {
  await fetch(`${API_URL}/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(dish) });
}

export async function deleteDish(id: number): Promise<void> {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: authHeaders() });
}
