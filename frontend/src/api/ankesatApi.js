import api from './axios.js';

export const ankesatApi = {
  getAll:         (params)    => api.get('/ankesat', { params }),
  getById:        (id)        => api.get(`/ankesat/${id}`),
  create:         (data)      => api.post('/ankesat', data),
  update:         (id, data)  => api.put(`/ankesat/${id}`, data),
  delete:         (id)        => api.delete(`/ankesat/${id}`),
  klientetList:   ()          => api.get('/ankesat-klientet'),
  punonjesitList: ()          => api.get('/ankesat-punonjesit'),
};
