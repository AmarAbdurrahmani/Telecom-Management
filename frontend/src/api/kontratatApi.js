import api from './axios.js';

export const kontratatApi = {
  getAll:       (params) => api.get('/kontratat', { params }),
  getById:      (id)     => api.get(`/kontratat/${id}`),
  create:       (data)   => api.post('/kontratat', data),
  update:       (id, data) => api.put(`/kontratat/${id}`, data),
  delete:       (id)     => api.delete(`/kontratat/${id}`),
  klientetList: ()       => api.get('/kontratat-klientet'),
  paketaList:   ()       => api.get('/kontratat-paketat'),
};
