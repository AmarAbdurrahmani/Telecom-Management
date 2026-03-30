import api from './axios.js';

export const klientetApi = {
  getAll:   (params)    => api.get('/klientet', { params }),
  getById:  (id)        => api.get(`/klientet/${id}`),
  detail:   (id)        => api.get(`/klientet/${id}/detail`),
  create:   (data)      => api.post('/klientet', data),
  update:   (id, data)  => api.put(`/klientet/${id}`, data),
  delete:   (id)        => api.delete(`/klientet/${id}`),
};
