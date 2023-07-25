const API_URL = 'http://localhost:3003/reserva';

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