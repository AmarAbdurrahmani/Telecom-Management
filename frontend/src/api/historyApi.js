import api from './axios.js';

export const historyApi = {
  getByKlient: (id, params) => api.get(`/klientet/${id}/historia`, { params }),
};
