import api from './axios.js';

export const simKartelaApi = {
  getByKlient:   (klientId)         => api.get(`/klientet/${klientId}/sim-kartela`),
  store:         (klientId, data)   => api.post(`/klientet/${klientId}/sim-kartela`, data),
  update:        (simId, data)      => api.put(`/sim-kartela/${simId}`, data),
  delete:        (simId)            => api.delete(`/sim-kartela/${simId}`),
  numratPerSim:  (klientId)         => api.get(`/klientet/${klientId}/numrat-per-sim`),
  gjenerojFature:(klientId, data)   => api.post(`/klientet/${klientId}/gjenero-fature`, data),
};
