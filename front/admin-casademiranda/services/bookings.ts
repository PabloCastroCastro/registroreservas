import { Booking } from "@/interfaces/booking";

const API_URL = 'http://localhost:3003/reserva';

export async function createBooking(booking:Booking) {
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

export async function getBookingByIdentifier(identifier) {
  try {
    const response = await fetch(`${API_URL}?dni=${identifier}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function getBookingById(bookingId) {
  try {
    const response = await fetch(`${API_URL}/${bookingId}`);
    const data = await response.json(); 
    console.log(JSON.stringify(data))
    return data;
  } catch (error) {
    return { message: error};
  }
}

const getSuspender = (promise) => {
    let status = "pending";
    let response;
  
    const suspender = promise.then(
      (res) => {
        status = "success";
        response = res;
      },
      (err) => {
        status = "error";
        response = err;
      }
    );
  
    const read = () => {
      switch (status) {
        case "pending":
          throw suspender;
        case "error":
          throw response;
        default:
          return response;
      }
    };
  
    return { read };
  };
  
  export function fetchData(identifier) {
    let url = `${API_URL}`;
    if(identifier !== undefined && identifier!== null){
        url = url+`?dni=${identifier}`
    }
    const promise = fetch(url)
      .then((response) => response.json())
      .then((json) => json);
  
    return getSuspender(promise);
  }