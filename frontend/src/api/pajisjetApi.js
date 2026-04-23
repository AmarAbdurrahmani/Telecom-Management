import api from './axios.js';

export const pajisjetApi = {
  getAll:     (params) => api.get('/pajisjet', { params }),
  getById:    (id)     => api.get(`/pajisjet/${id}`),
  create:     (data)   => api.post('/pajisjet', data),
  update:     (id, data) => api.put(`/pajisjet/${id}`, data),
  delete:     (id)     => api.delete(`/pajisjet/${id}`),
  listAktive: ()       => api.get('/pajisjet-aktive'),
};
