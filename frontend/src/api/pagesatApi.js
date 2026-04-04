import api from './axios.js';

export const pagesatApi = {
  getAll:      (params) => api.get('/pagesat', { params }),
  getById:     (id)     => api.get(`/pagesat/${id}`),
  create:      (data)   => api.post('/pagesat', data),
  update:      (id, data) => api.put(`/pagesat/${id}`, data),
  delete:      (id)     => api.delete(`/pagesat/${id}`),
  faturatList: ()       => api.get('/pagesat-faturat'),
};
