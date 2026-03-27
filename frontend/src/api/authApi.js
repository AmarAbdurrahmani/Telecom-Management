import axios from 'axios';
import api from './axios.js';

export const authApi = {
  register: (data)            => api.post('/auth/register', data),
  login:    (credentials)     => api.post('/auth/login', credentials),
  logout:   ()                => api.post('/auth/logout'),
  me:       ()                => api.get('/auth/me'),

  /**
   * Refresh is called with a plain axios instance so it always
   * carries the cookie but never triggers the 401 interceptor loop.
   */
  refresh: () =>
    axios.post(
      `${import.meta.env.VITE_API_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    ),
};
