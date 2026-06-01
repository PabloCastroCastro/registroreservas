import { Booking, RequestBooking } from "@/interfaces/booking";
import { getToken } from '../auth/auth';

const API_HOST = 'https://192.168.1.171'
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
    console.error(res);
    return `Procesado: ${res}`;
  } catch (err) {
    console.error(err);
    return "Error al subir el archivo";
  }
}