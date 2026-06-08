import type { Client, ClientDTO } from "@/interfaces/client";
import { getToken } from '../auth/auth';
import { API_HOST } from './config';

export interface DniScanResult {
    nombre: string;
    apellido1: string;
    apellido2: string;
    documentNumber: string;
    supportDocument: string;
    birthDate: string | null;
    expirationDate: string | null;
    expeditionDate: string | null;
    sex: string;
    nationality: string;
    domicilio: string | null;
    municipio: string | null;
    provincia: string | null;
}

export async function parseDNI(back: File, front?: File): Promise<DniScanResult> {
    const token = getToken();
    const formData = new FormData();
    formData.append('back', back);
    if (front) formData.append('front', front);
    const res = await fetch(`${API_HOST}/parse-dni`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
    }
    return res.json();
}

const API_URL = `${API_HOST}/cliente`;


export async function createClient(client: Client) {
  try {

    console.log('client: ', JSON.stringify(client))
    const token = getToken();

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(client)
    };



    const response = await fetch(`${API_URL}`, requestOptions);
    const data = await response.json();
    return processResult(data);
  } catch (error) {
    console.error(error);
  }
}

export async function updateClient(client: Client) {
  try {
    const token = getToken();

    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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

    return processResultList(data);
  } catch (error) {
    console.error(error);
  }
}


export async function getClientById(clientId: string) {
  try {
    const token = getToken();

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    console.log('Client Id: ', clientId);
    const response = await fetch(`${API_URL}/${clientId}`, requestOptions);
    const data = await response.json();
    return processResult(data);
  } catch (error) {
    console.error(error);
  }
}

export async function getClientByIdentifier(identifier: string) {
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
    return processResultList(data);
  } catch (error) {
    console.error(error);
  }
}

export async function getClientsByBookingId(booking_id: string) {
  try {
    const token = getToken();
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await fetch(`${API_URL}?reservaId=${booking_id}`, requestOptions);
    const data = await response.json();
    return processResultList(data);
  } catch (error) {
    console.error(error);
  }
}

async function processResultList(data: ClientDTO[]) {
  const mapToClients: Client[] = [];
  data.map(clientResult => mapToClients.push({
    client_id: clientResult.customer_id,
    check_in: clientResult.check_in,
    nacionality: clientResult.nacionality,
    document_type: clientResult.document_type,
    document_number: clientResult.identifier,
    support_document: clientResult.support_document,
    expedition_date: clientResult.expedition_date,
    name: clientResult.name,
    firstSurname: clientResult.surname ?? "",
    secondSurname: clientResult.surname2 ?? "",
    gender: clientResult.gender,
    birthdate: clientResult.birthdate,
    phone: clientResult.phone,
    other_phone: clientResult.other_phone,
    email: clientResult.email,
    relationship: clientResult.relationship,
    booking_id: clientResult.booking_id,
    address: {
      line: clientResult.line,
      line2: clientResult.line2,
      country: clientResult.country,
      province: clientResult.province,
      location: clientResult.location,
      postalCode: clientResult.postalCode
    },
    made_booking: clientResult.made_booking
  }));
  return mapToClients;
}

async function processResult(clientResult: ClientDTO) {
  const client: Client = {
    client_id: clientResult.customer_id,
    check_in: clientResult.check_in,
    nacionality: clientResult.nacionality,
    document_type: clientResult.document_type,
    document_number: clientResult.identifier,
    support_document: clientResult.support_document,
    expedition_date: clientResult.expedition_date,
    name: clientResult.name,
    firstSurname: clientResult.surname ?? "",
    secondSurname: clientResult.surname2 ?? "",
    gender: clientResult.gender,
    birthdate: clientResult.birthdate,
    phone: clientResult.phone,
    other_phone: clientResult.other_phone,
    email: clientResult.email,
    relationship: clientResult.relationship,
    booking_id: clientResult.booking_id,
    address: {
      line: clientResult.line,
      line2: clientResult.line2,
      country: clientResult.country,
      province: clientResult.province,
      location: clientResult.location,
      postalCode: clientResult.postalCode
    },
    made_booking: clientResult.made_booking
  };
  return client;
}