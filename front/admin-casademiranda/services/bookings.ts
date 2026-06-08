import { Booking, RequestBooking, RequestUpdateBooking } from "@/interfaces/booking";
import { getToken } from '../auth/auth';
import { API_HOST } from './config';

const API_URL = `${API_HOST}/reserva`;

export async function createBooking(booking: RequestBooking) {
  try {

    console.log('Booking: ', JSON.stringify(booking))
    const token = getToken();

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(booking)
    };

    const response = await fetch(`${API_URL}`, requestOptions);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function getAllBookings() {
  try {
    const token = getToken();

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await fetch(`${API_URL}`, requestOptions);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function getBookingByIdentifier(identifier: String) {
  try {
    const token = getToken();

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await fetch(`${API_URL}?dni=${identifier}`, requestOptions);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function getBookingById(bookingId: String) {
  try {
    const token = getToken();

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await fetch(`${API_URL}/${bookingId}`, requestOptions);
    const data = await response.json();
    console.log(JSON.stringify(data))
    return data;
  } catch (error) {
    return { message: error };
  }
}

export async function postRegisterCheckIn(bookingId: String) {
  try {
    const token = getToken();

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await fetch(`${API_URL}/${bookingId}/check-in`, requestOptions);
    const status = response.status;
    return {
      status: status
    };

  } catch (error) {
    return {
      status: 500,
      message: error
    };
  }
}

export async function updateBooking(bookingId: string, booking: RequestUpdateBooking) {
  const token = getToken();
  const response = await fetch(`${API_URL}/${bookingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(booking)
  });
  return response.status;
}

export async function cancelBooking(bookingId: string) {
  const token = getToken();
  const response = await fetch(`${API_URL}/${bookingId}/cancel`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.status;
}

export async function deleteBooking(bookingId: string) {
  const token = getToken();
  const response = await fetch(`${API_URL}/${bookingId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.status;
}

export async function getRoomsAvailability(checkIn: string, checkOut: string, excludeId?: string): Promise<Record<string, boolean>> {
  const token = getToken();
  const params = new URLSearchParams({ checkIn, checkOut });
  if (excludeId) params.append('excludeId', excludeId);
  const res = await fetch(`${API_HOST}/reserva/disponibilidad?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) return {};
  const data = await res.json();
  return data.rooms ?? {};
}

export async function checkBookingSync() {
  const token = getToken();
  const response = await fetch(`${API_HOST}/booking-sync/check`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Error HTTP ${response.status}`);
  }
  return response.json();
}

export async function markBookingSyncRead() {
  const token = getToken();
  const response = await fetch(`${API_HOST}/booking-sync/mark-read`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}

export async function getLastBookingSync(): Promise<string | null> {
  const token = getToken();
  const response = await fetch(`${API_HOST}/booking-sync/last-sync`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.lastSyncAt ?? null;
}

export async function loadBookingBatch(file: File) {
  const token = getToken();
  const formData = new FormData();
  formData.append("excelFile", file);

  try {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    };

    const res = await fetch(`${API_HOST}/upload-booking`, requestOptions);
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}