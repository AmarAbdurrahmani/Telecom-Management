import { create } from 'zustand';

// Read persisted token on module load (runs once when the app starts)
const _storedToken = localStorage.getItem('auth_token') || null;

/**
 * Auth state.
 * - accessToken is persisted in localStorage so it survives page reloads.
 * - On every app boot, App.jsx validates the stored token via GET /auth/me.
 * - The HTTP-Only refresh cookie is kept as a fallback for when the
 *   access token is expired (the 401 interceptor in axios.js handles this).
 */
export const useAuthStore = create((set) => ({
  accessToken:     _storedToken,
  user:            null,            // hydrated during app init via /auth/me
  isAuthenticated: !!_storedToken,  // true immediately if token exists
  isInitialized:   false,           // true once the boot validation completes

  setAuth: (token, user) => {
    if (token) localStorage.setItem('auth_token', token);
    set({ accessToken: token, user, isAuthenticated: true });
  },

  setAccessToken: (token) => {
    if (token) localStorage.setItem('auth_token', token);
    else        localStorage.removeItem('auth_token');
    set({ accessToken: token, isAuthenticated: !!token });
  },

  setUser: (user) => set({ user }),

  clearAuth: () => {
    localStorage.removeItem('auth_token');
    set({ accessToken: null, user: null, isAuthenticated: false });
  },

  setInitialized: () => set({ isInitialized: true }),
}));
