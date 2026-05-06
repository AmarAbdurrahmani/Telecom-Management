import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import AppLayout from '../components/Layout/AppLayout.jsx';
import PortalLayout from '../components/Layout/PortalLayout.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import KlientetPage from '../features/klientet/KlientetPage.jsx';
import PaketaPage from '../features/paketat/PaketaPage.jsx';
import KontratatPage from '../features/kontratat/KontratatPage.jsx';
import FaturatPage from '../features/faturat/FaturatPage.jsx';
import NumratPage from '../features/numrat/NumratPage.jsx';
import SherbimetPage from '../features/sherbimet/SherbimetPage.jsx';
import KlientDetajet from '../features/klientet/KlientDetajet.jsx';
import UsersPage from '../features/users/UsersPage.jsx';
import KlientPortalPage from '../features/portal/KlientPortalPage.jsx';
import AnkesatPage from '../features/ankesat/AnkesatPage.jsx';
import InfrastrukturaPage from '../features/infrastruktura/InfrastrukturaPage.jsx';
import PagesatPage from '../features/pagesat/PagesatPage.jsx';
import PajisjetPage from '../features/pajisjet/PajisjetPage.jsx';
import LifecyclePage from '../features/kontratat/LifecyclePage.jsx';
import ChatPage from '../pages/ChatPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );
}

// Redirect authenticated users to the right home based on role
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isInitialized, user } = useAuthStore();
  if (!isInitialized) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.roli)) {
    // Wrong role — send them to their own home
    return <Navigate to={user.roli === 'klient' ? '/portal' : '/dashboard'} replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isInitialized, user } = useAuthStore();
  if (!isInitialized) return <FullPageSpinner />;
  if (isAuthenticated) {
    return <Navigate to={user?.roli === 'klient' ? '/portal' : '/dashboard'} replace />;
  }
  return children;
}

const STAFF_ROLES = ['admin', 'tl', 'sv', 'agent'];

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={<PublicRoute><LoginPage /></PublicRoute>}
      />

      {/* ── Staff panel (admin, tl, sv, agent) ── */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={STAFF_ROLES}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* All staff */}
        <Route path="dashboard"    element={<DashboardPage />} />
        <Route path="klientet"     element={<KlientetPage />} />
        <Route path="klientet/:id" element={<KlientDetajet />} />
        <Route path="pagesat"      element={<PagesatPage />} />
        <Route path="ankesat"      element={<AnkesatPage />} />
        <Route path="chat"         element={<ChatPage />} />

        {/* admin · tl · sv */}
        <Route path="kontratat"  element={<ProtectedRoute allowedRoles={['admin','tl','sv']}><KontratatPage /></ProtectedRoute>} />
        <Route path="lifecycle"  element={<ProtectedRoute allowedRoles={['admin','tl','sv']}><LifecyclePage /></ProtectedRoute>} />
        <Route path="faturat"    element={<ProtectedRoute allowedRoles={['admin','tl','sv']}><FaturatPage /></ProtectedRoute>} />

        {/* admin · tl */}
        <Route path="paketat"          element={<ProtectedRoute allowedRoles={['admin','tl']}><PaketaPage /></ProtectedRoute>} />
        <Route path="pajisjet"         element={<ProtectedRoute allowedRoles={['admin','tl']}><PajisjetPage /></ProtectedRoute>} />
        <Route path="numrat-telefonit" element={<ProtectedRoute allowedRoles={['admin','tl']}><NumratPage /></ProtectedRoute>} />
        <Route path="sherbimet-shtesa" element={<ProtectedRoute allowedRoles={['admin','tl']}><SherbimetPage /></ProtectedRoute>} />
        <Route path="infrastruktura"   element={<ProtectedRoute allowedRoles={['admin','tl']}><InfrastrukturaPage /></ProtectedRoute>} />

        {/* admin only */}
        <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
      </Route>

      {/* ── Klient portal ── */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute allowedRoles={['klient']}>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<KlientPortalPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
