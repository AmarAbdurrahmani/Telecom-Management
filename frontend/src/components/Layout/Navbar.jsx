import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import NotificationCenter from '../ui/NotificationCenter.jsx';
import GlobalSearch from '../ui/GlobalSearch.jsx';

const PAGE_TITLES = {
  '/dashboard':         'Ballina',
  '/klientet':          'Klientët',
  '/paketat':           'Paketat',
  '/kontratat':         'Kontratat',
  '/lifecycle':         'Mirëmbajtje',
  '/pajisjet':          'Pajisjet',
  '/faturat':           'Faturat',
  '/pagesat':           'Pagesat',
  '/numrat-telefonit':  'Numrat e Telefonit',
  '/ankesat':           'Ankesat',
  '/sherbimet-shtesa':  'Shërbimet Shtesë',
  '/infrastruktura':    'Infrastruktura',
  '/users':             'Menaxhimi i Stafit',
};

export default function Navbar({ onMenuClick }) {
  const { logout }          = useAuth();
  const { pathname }        = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const title = Object.entries(PAGE_TITLES).find(([p]) => pathname.startsWith(p))?.[1] ?? 'Dashboard';

  // ── Ctrl+K shortcut + custom event from any page ─────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    const onEvent = () => setSearchOpen(true);
    document.addEventListener('keydown', onKey);
    window.addEventListener('open-global-search', onEvent);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('open-global-search', onEvent);
    };
  }, []);

  return (
    <>
      <header className="h-[72px] bg-white border-b border-[#f0edf8] flex items-center justify-between px-5 lg:px-6 flex-shrink-0">
        {/* Left — title + mobile hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-9 h-9 rounded-xl bg-[#f0edf8] flex items-center justify-center text-slate-500 hover:text-[#7c5cdb] transition-colors"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-[17px] font-black text-slate-800 leading-tight">{title}</h1>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              {new Date().toLocaleDateString('sq-AL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <NotificationCenter />

          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="group flex items-center gap-2 h-9 rounded-xl bg-[#1e293b] px-3 text-white/70 hover:text-white transition-colors"
            title="Kërko (Ctrl+K)"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden md:flex items-center gap-1 text-[11px] font-bold text-white/40 group-hover:text-white/60 transition-colors">
              <kbd className="px-1 rounded bg-white/10 font-bold">Ctrl</kbd>
              <span>K</span>
            </span>
          </button>

          {/* Create new */}
          <Link
            to="/kontratat"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-[#7c5cdb] to-[#a78bfa] hover:from-[#6d4fcb] hover:to-[#9370f0] shadow-[0_2px_12px_rgba(124,92,219,0.4)] transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Krijo të ri
          </Link>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-9 h-9 rounded-xl bg-[#1e293b] flex items-center justify-center text-white/70 hover:text-red-400 transition-colors"
            title="Dil"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Global search overlay */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
