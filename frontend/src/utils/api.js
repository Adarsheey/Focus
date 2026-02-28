import { auth } from '../firebase';

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchWithAuth(url, options = {}) {
    const user = auth.currentUser;

    if (!user) {
        throw new Error('No user is currently authenticated.');
    }

    const token = await user.getIdToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers
    });

    return response;
}