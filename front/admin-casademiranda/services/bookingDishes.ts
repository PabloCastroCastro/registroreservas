import type { BookingDish, RequestBookingDish } from '../interfaces/bookingDish';
import { getToken } from '../auth/auth';
import { API_HOST } from './config';

function headers() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
}

export async function getBookingDishes(bookingId: string): Promise<BookingDish[]> {
    const res = await fetch(`${API_HOST}/reserva/${bookingId}/cenas`, { headers: headers() });
    return res.json();
}

export async function addBookingDish(bookingId: string, dish: RequestBookingDish): Promise<void> {
    await fetch(`${API_HOST}/reserva/${bookingId}/cenas`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(dish),
    });
}

export async function removeBookingDish(bookingId: string, bookingDishId: number): Promise<void> {
    await fetch(`${API_HOST}/reserva/${bookingId}/cenas/${bookingDishId}`, {
        method: 'DELETE',
        headers: headers(),
    });
}
