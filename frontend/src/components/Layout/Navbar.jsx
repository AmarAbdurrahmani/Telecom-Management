import { useAuth } from '../../hooks/useAuth.js';

const ROLE_LABELS = {
  admin:  'Admin',
  tl:     'Team Lead',
  sv:     'Supervisor',
  agent:  'Agjent',
  klient: 'Klient',
};

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Left — hamburger on mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-black text-slate-600">
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[11px] text-slate-400 uppercase font-medium tracking-wider">
              {ROLE_LABELS[user?.roli] ?? user?.roli}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Dil</span>
        </button>
      </div>
    </header>
  );
}
