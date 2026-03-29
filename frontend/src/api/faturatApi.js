import api from './axios.js';

export const faturatApi = {
  getAll:        (params)    => api.get('/faturat', { params }),
  getById:       (id)        => api.get(`/faturat/${id}`),
  create:        (data)      => api.post('/faturat', data),
  update:        (id, data)  => api.put(`/faturat/${id}`, data),
  delete:        (id)        => api.delete(`/faturat/${id}`),
  kontratatList: ()          => api.get('/faturat-kontratat'),
};
