import api from './axios.js';

export const numratTelefonitApi = {
  getAll:        (params)   => api.get('/numrat-telefonit', { params }),
  getById:       (id)       => api.get(`/numrat-telefonit/${id}`),
  create:        (data)     => api.post('/numrat-telefonit', data),
  update:        (id, data) => api.put(`/numrat-telefonit/${id}`, data),
  delete:        (id)       => api.delete(`/numrat-telefonit/${id}`),
  kontratatList: ()         => api.get('/numrat-kontratat'),
};
