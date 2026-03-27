import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppRouter from './router/index.jsx';
import { useAuthStore } from './store/authStore.js';
import { authApi } from './api/authApi.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

/**
 * On every app load, attempt a silent token refresh using the HTTP-Only cookie.
 * If it succeeds, the access token is stored in Zustand (memory only).
 * If it fails, the user is treated as unauthenticated.
 */
function AuthInitializer({ children }) {
  const { setAuth, clearAuth, setInitialized } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await authApi.refresh();
        setAuth(data.data.access_token, data.data.user);
      } catch {
        clearAuth();
      } finally {
        setInitialized();
      }
    };

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <AppRouter />
        </AuthInitializer>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
