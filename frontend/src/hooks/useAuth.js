import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi.js';
import { useAuthStore } from '../store/authStore.js';

export function useAuth() {
  const { accessToken, user, isAuthenticated, isInitialized, setAuth, clearAuth } =
    useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(
    async (email, password) => {
      const { data } = await authApi.login({ email, password });
      setAuth(data.data.access_token, data.data.user);
      toast.success(`Mirësevini, ${data.data.user.name}!`);
      navigate('/dashboard');
    },
    [setAuth, navigate]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the server call fails, clear the local state
    } finally {
      clearAuth();
      navigate('/login');
    }
  }, [clearAuth, navigate]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isInitialized,
    login,
    logout,
  };
}
