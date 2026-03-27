import api from './axios.js';

export const paketaApi = {
  getAll:  (params)    => api.get('/paketat', { params }),
  getById: (id)        => api.get(`/paketat/${id}`),
  create:  (data)      => api.post('/paketat', data),
  update:  (id, data)  => api.put(`/paketat/${id}`, data),
  delete:  (id)        => api.delete(`/paketat/${id}`),
};
