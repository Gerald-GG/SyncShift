import api from './axios';

export const signIn     = (coords)  => api.post('/attendance/signin', coords);
export const signOut    = (coords)  => api.post('/attendance/signout', coords);
export const getStatus  = ()        => api.get('/attendance/status');
export const getHistory = (params)  => api.get('/attendance/history', { params });
