import type { User } from '../interfaces/user'
import { API_HOST } from './config';

const API_URL = `${API_HOST}/loginuser`;


export async function login(user: User) {
    try {

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        };

        const response = await fetch(`${API_URL}`, requestOptions);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}