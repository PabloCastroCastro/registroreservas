import type { Client } from "@/interfaces/client";

const API_URL = 'http://localhost:3003/cliente';


export async function createClient(client: Client) {
  try {

    console.log('client: ', JSON.stringify(client))

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    };

    const response = await fetch(`${API_URL}`, requestOptions);
    const data = await response.json();
    console.log(JSON.stringify(data));
    return processResultList(data);
  } catch (error) {
    console.error(error);
  }
}

export async function updateClient(client: Client) {
  try {
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    };

    const response = await fetch(`${API_URL}`, requestOptions);
    const data = await response.json();
    return processResult(data);
  } catch (error) {
    console.error(error);
  }
}

export async function getAllClients() {
  try {
    const response = await fetch(`${API_URL}`);
    const data = await response.json();

    return processResultList(data);
  } catch (error) {
    console.error(error);
  }
}


export async function getClientById(clientId: string) {
  try {
    console.log('Client Id: ', clientId);
    const response = await fetch(`${API_URL}/${clientId}`);
    const data = await response.json();
    return processResult(data);
  } catch (error) {
    console.error(error);
  }
}

export async function getClientByIdentifier(identifier: string) {
  try {
    const response = await fetch(`${API_URL}?dni=${identifier}`);
    const data = await response.json();
    return processResultList(data);
  } catch (error) {
    console.error(error);
  }
}

export async function getClientsByBookingId(booking_id: string) {
  try {
    const response = await fetch(`${API_URL}?reservaId=${booking_id}`);
    const data = await response.json();
    return processResultList(data);
  } catch (error) {
    console.error(error);
  }
}

async function processResultList(data) {
  const mapToClients:Client[] = [];
  data.map(clientResult => mapToClients.push({
    client_id: clientResult.customer_id,
    check_in: clientResult.check_in,
    nacionality: clientResult.nacionality,
    document_type: clientResult.document_type,
    document_number: clientResult.identifier,
    expedition_date: clientResult.expedition_date,
    name: clientResult.name,
    firstSurname: clientResult.surname !== undefined?clientResult.surname.split(' ')[0]:"",
    secondSurname: clientResult.surname !== undefined && clientResult.surname.split(' ').length > 1?clientResult.surname.split(' ')[clientResult.surname.length - 1]:"",
    gender: clientResult.gender,
    birthdate: clientResult.birthdate,
    booking_id: clientResult.booking_id,
    made_booking: clientResult.made_booking
  }));
  return mapToClients;
}

async function processResult(clientResult) {
  const client:Client = {
    client_id: clientResult.customer_id,
    check_in: clientResult.check_in,
    nacionality: clientResult.nacionality,
    document_type: clientResult.document_type,
    document_number: clientResult.identifier,
    expedition_date: clientResult.expedition_date,
    name: clientResult.name,
    firstSurname: clientResult.surname !== undefined?clientResult.surname.split(' ')[0]:"",
    secondSurname: clientResult.surname !== undefined && clientResult.surname.split(' ').length > 1?clientResult.surname.split(' ')[clientResult.surname.length - 1]:"",
    gender: clientResult.gender,
    birthdate: clientResult.birthdate,
    booking_id: clientResult.booking_id,
    made_booking: clientResult.made_booking
  };
  return client;
}