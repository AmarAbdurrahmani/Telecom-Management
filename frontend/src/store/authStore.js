import { create } from 'zustand';

/**
 * Auth state lives in memory only.
 * The access token is NEVER written to localStorage or sessionStorage.
 * On page reload, App.jsx performs a silent refresh via the HTTP-Only cookie.
 */
export const useAuthStore = create((set) => ({
  accessToken:     null,
  user:            null,
  isAuthenticated: false,
  isInitialized:   false, // true once the initial silent refresh attempt completes

  setAuth: (token, user) =>
    set({ accessToken: token, user, isAuthenticated: true }),

  setAccessToken: (token) =>
    set({ accessToken: token, isAuthenticated: !!token }),

  setUser: (user) => set({ user }),

  clearAuth: () =>
    set({ accessToken: null, user: null, isAuthenticated: false }),

  setInitialized: () => set({ isInitialized: true }),
}));
