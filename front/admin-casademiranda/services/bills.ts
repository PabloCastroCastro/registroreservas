import type { Bill } from '../interfaces/bill'
import { getToken } from '../auth/auth';
import { API_HOST } from './config';

const API_URL = `${API_HOST}/factura`;


export async function createBill(bill: Bill) {
    try {

        console.log('Bill: ', JSON.stringify(bill));
        const token = getToken();


        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`

            },
            body: JSON.stringify(bill)
        };

        const response = await fetch(`${API_URL}`, requestOptions);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}