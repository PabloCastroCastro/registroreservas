import { Booking, RequestBooking } from "@/interfaces/booking";

const API_URL = 'http://192.168.1.150/reserva';

export async function createBooking(booking:RequestBooking) {
  try {

      console.log('Booking: ', JSON.stringify(booking))

      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(`${API_URL}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function getBookingByIdentifier(identifier:String) {
  try {
    const response = await fetch(`${API_URL}?dni=${identifier}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function getBookingById(bookingId:String) {
  try {
    const response = await fetch(`${API_URL}/${bookingId}`);
    const data = await response.json(); 
    console.log(JSON.stringify(data))
    return data;
  } catch (error) {
    return { message: error};
  }
}