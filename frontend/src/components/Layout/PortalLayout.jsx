import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function PortalLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top bar */}
      <header className="bg-black/20 backdrop-blur border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">T</span>
            </div>
            <span className="font-black text-white text-lg tracking-tight">TelecomMS</span>
            <span className="hidden sm:inline text-white/30 text-sm font-medium ml-1">· Portali im</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-black text-white">{user?.name?.charAt(0) ?? 'K'}</span>
              </div>
              <span className="text-sm font-semibold text-white/80">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm font-semibold text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Dil
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
