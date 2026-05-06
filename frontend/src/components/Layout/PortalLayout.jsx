import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function PortalLayout() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'K';

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-violet-100/80 shadow-sm shadow-violet-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center shadow-md shadow-violet-200 flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="font-black text-[15px] tracking-tight text-slate-800 leading-none">TelecomMS</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Portali im</p>
            </div>
          </div>

          {/* User pill + logout */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2.5 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-xl">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-black text-white">{initials}</span>
              </div>
              <span className="text-sm font-semibold text-slate-700 max-w-[140px] truncate">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#7c3aed] transition-colors px-3 py-2 rounded-xl hover:bg-violet-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Dil</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
