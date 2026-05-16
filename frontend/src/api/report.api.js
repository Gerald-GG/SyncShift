import api from './axios';

export const getUserReport = (userId, params) =>
  api.get(`/admin/reports/user/${userId}`, { params });

export const downloadCSV = (userId, params) =>
  api.get(`/admin/reports/user/${userId}`, {
    params:       { ...params, export: 'csv' },
    responseType: 'blob',
  });
