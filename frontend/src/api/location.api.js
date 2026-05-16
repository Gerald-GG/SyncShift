import api from './axios';

export const getLocations    = ()         => api.get('/admin/locations');
export const createLocation  = (data)     => api.post('/admin/locations', data);
export const updateLocation  = (id, data) => api.patch(`/admin/locations/${id}`, data);
export const deleteLocation  = (id)       => api.delete(`/admin/locations/${id}`);
