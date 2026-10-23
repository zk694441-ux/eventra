import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || '/api';
const baseURL = rawBaseURL.replace(/\/+$/, '');

const api = axios.create({ baseURL });

export const getEvents = (params) => api.get('/events', { params }).then(r => r.data);
export const getEvent = (id) => api.get(`/events/${id}`).then(r => r.data);
export const createEvent = (data) => api.post('/events', data).then(r => r.data);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data).then(r => r.data);
export const deleteEvent = (id) => api.delete(`/events/${id}`).then(r => r.data);
export const registerForEvent = (id, data) => api.post(`/events/${id}/register`, data).then(r => r.data);
export const getRegistrations = () => api.get('/registrations').then(r => r.data);
