import api from './axios.js';

export const tanApi = {
  generate: (klientId)          => api.post(`/klientet/${klientId}/kerko-tan`),
  verify:   (klientId, token)   => api.post(`/klientet/${klientId}/verifiko-tan`, { token }),
  active:   (klientId)          => api.get(`/klientet/${klientId}/tan-aktiv`),
  skaduese: ()                  => api.get('/kontratat-skaduese'),
};
