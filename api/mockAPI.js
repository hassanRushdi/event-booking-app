import axios from 'axios'

const MOCKAPI_BASE_URL = 'https://6811232c3ac96f7119a3b38d.mockapi.io';

const apiClient = axios.create({
    baseURL: MOCKAPI_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getUserByEmail = (email) => apiClient.get(`/users?email=${email}`); // Note: mockAPI filtering
export const createUser = (userData) => apiClient.post('/users', userData);
export const getUserById = (userId) => apiClient.get(`/users/${userId}`);
export const updateUser = (userId, data) => apiClient.put(`/users/${userId}`, data);

export const getEvents = () => apiClient.get('/events');
export const getEventById = (eventId) => apiClient.get(`/events/${eventId}`);
export const updateEvent = (eventId, data) => apiClient.put(`/events/${eventId}`, data);

export default apiClient;

