import type {Bill} from '../interfaces/bill'

const API_URL = 'http://192.168.1.150/factura';


export async function createBill(bill:Bill) {
    try {

        console.log('Bill: ', JSON.stringify(bill))

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bill)
        };

        const response = await fetch(`${API_URL}`, requestOptions);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}