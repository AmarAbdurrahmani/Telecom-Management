import api from './axios.js';

export const usersApi = {
  getAll:        (params)         => api.get('/users', { params }),
  getById:       (id)             => api.get(`/users/${id}`),
  create:        (data)           => api.post('/users', data),
  update:        (id, data)       => api.put(`/users/${id}`, data),
  delete:        (id)             => api.delete(`/users/${id}`),
  resetPassword: (id, password)   => api.post(`/users/${id}/reset-password`, { password }),
};
