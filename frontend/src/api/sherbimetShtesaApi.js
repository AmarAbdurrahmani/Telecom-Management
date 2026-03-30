import api from './axios.js';

export const sherbimetShtesaApi = {
  getAll:                 (params)           => api.get('/sherbimet-shtesa', { params }),
  getById:                (id)               => api.get(`/sherbimet-shtesa/${id}`),
  create:                 (data)             => api.post('/sherbimet-shtesa', data),
  update:                 (id, data)         => api.put(`/sherbimet-shtesa/${id}`, data),
  delete:                 (id)               => api.delete(`/sherbimet-shtesa/${id}`),
  kontratatList:          ()                 => api.get('/sherbimet-kontratat'),
  syncKontratat:          (id, kontrate_ids) => api.post(`/sherbimet-shtesa/${id}/sync`, { kontrate_ids }),
  syncSherbimetForKontrate: (kontrate_id, sherbim_ids) =>
                            api.post(`/kontratat/${kontrate_id}/sherbimet`, { sherbim_ids }),
};
