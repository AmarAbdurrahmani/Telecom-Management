import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import AppLayout from '../components/Layout/AppLayout.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import KlientetPage from '../features/klientet/KlientetPage.jsx';
import PaketaPage from '../features/paketat/PaketaPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuthStore();
  if (!isInitialized) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuthStore();
  if (!isInitialized) return <FullPageSpinner />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={<PublicRoute><LoginPage /></PublicRoute>}
      />

      {/* Protected — nested under AppLayout (sidebar + navbar) */}
      <Route
        path="/"
        element={<ProtectedRoute><AppLayout /></ProtectedRoute>}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="klientet"  element={<KlientetPage />} />
        <Route path="paketat"   element={<PaketaPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
