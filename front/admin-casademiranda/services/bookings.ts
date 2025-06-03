import { Booking, RequestBooking } from "@/interfaces/booking";
import { getToken } from '../auth/auth';

const API_URL = 'http://localhost:3003/reserva';

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