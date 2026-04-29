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
 * Runs once on every page load to restore the authenticated session.
 *
 * Priority order:
 *  1. localStorage token  → validate via GET /auth/me
 *     - If valid: hydrate user state and continue.
 *     - If expired: the 401 interceptor in axios.js automatically tries the
 *       HTTP-Only refresh cookie, issues a new token, and retries /auth/me.
 *     - If both fail: clearAuth → router sends user to /login.
 *  2. No localStorage token → try HTTP-Only cookie silent refresh directly.
 *     - If ok: save new token to localStorage + hydrate user.
 *     - If fails: clearAuth → /login.
 */
function AuthInitializer({ children }) {
  const { setAuth, clearAuth, setInitialized } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem('auth_token');

      if (storedToken) {
        try {
          // GET /auth/me — returns the user object directly (not nested in data.data)
          // The request interceptor in axios.js attaches the Bearer token automatically.
          // If the token is expired, the 401 interceptor will silently refresh it
          // via the HTTP-Only cookie and retry this call before we see any error.
          const { data: user } = await authApi.me();

          // After the call, the interceptor may have issued a newer token —
          // always read the current one from the store, not the original storedToken.
          const currentToken = useAuthStore.getState().accessToken;
          setAuth(currentToken || storedToken, user);
        } catch {
          // Token invalid and refresh cookie unavailable/expired → force login
          clearAuth();
        }
      } else {
        // No token in localStorage — try the HTTP-Only refresh cookie
        try {
          const { data } = await authApi.refresh();
          setAuth(data.data.access_token, data.data.user);
        } catch {
          clearAuth();
        }
      }

      setInitialized();
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
