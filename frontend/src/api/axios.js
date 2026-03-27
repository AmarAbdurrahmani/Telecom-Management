import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Required: sends the HTTP-Only refresh_token cookie
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer access token from Zustand (memory only)
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor — silent refresh on 401
// ---------------------------------------------------------------------------
let isRefreshing = false;
let pendingQueue = []; // requests waiting for the refresh to complete

const drainQueue = (error, newToken = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(newToken);
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    const is401          = error.response?.status === 401;
    const alreadyRetried = original._retry;
    const isRefreshCall  = original.url?.includes('/auth/refresh');
    const isLoginCall    = original.url?.includes('/auth/login');

    if (is401 && !alreadyRetried && !isRefreshCall && !isLoginCall) {
      // Another request is already refreshing — queue this one
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        // Use a plain axios call (not the api instance) to avoid circular interception
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = data.data.access_token;
        const user     = data.data.user;

        useAuthStore.getState().setAuth(newToken, user);
        drainQueue(null, newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        drainQueue(refreshError);
        useAuthStore.getState().clearAuth();
        // Redirect to login — let the router handle the UI
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
