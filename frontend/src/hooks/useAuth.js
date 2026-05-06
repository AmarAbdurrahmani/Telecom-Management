import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi.js';
import { useAuthStore } from '../store/authStore.js';

function homeForRole(roli) {
  return roli === 'klient' ? '/portal' : '/dashboard';
}

export function useAuth() {
  const { accessToken, user, isAuthenticated, isInitialized, setAuth, clearAuth } =
    useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const login = useCallback(
    async (email, password) => {
      const { data } = await authApi.login({ email, password });
      setAuth(data.data.access_token, data.data.user);
      toast.success(`Mirësevini, ${data.data.user.name}!`);
      navigate(homeForRole(data.data.user.roli));
    },
    [setAuth, navigate]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the server call fails, clear local state
    } finally {
      queryClient.clear(); // wipe all cached queries so next user starts fresh
      clearAuth();
      navigate('/login');
    }
  }, [clearAuth, navigate, queryClient]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isInitialized,
    login,
    logout,
    homeForRole,
  };
}
