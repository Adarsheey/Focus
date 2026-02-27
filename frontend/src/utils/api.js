import { auth } from '../firebase';

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

    const response = await fetch(url, {
        ...options,
        headers
    });

    return response;
}
