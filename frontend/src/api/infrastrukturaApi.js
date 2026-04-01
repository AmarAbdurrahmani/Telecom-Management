import api from './axios.js';

export const infrastrukturaApi = {
  getAll: (params) => api.get('/infrastruktura', { params }),
  getById:(id)     => api.get(`/infrastruktura/${id}`),
  create: (data)   => api.post('/infrastruktura', data),
  update: (id, data) => api.put(`/infrastruktura/${id}`, data),
  delete: (id)     => api.delete(`/infrastruktura/${id}`),
};
