import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import UserAvatar from '../ui/UserAvatar.jsx';

const NAV_ITEMS = [
  {
    path: '/dashboard', label: 'Ballina',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    path: '/klientet', label: 'Klientët',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    path: '/paketat', label: 'Paketat',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  },
  {
    path: '/kontratat', label: 'Kontratat',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    path: '/lifecycle', label: 'Mirëmbajtje',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  },
  {
    path: '/pajisjet', label: 'Pajisjet',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  },
  {
    path: '/faturat', label: 'Faturat',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>,
  },
  {
    path: '/pagesat', label: 'Pagesat',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  },
  {
    path: '/numrat-telefonit', label: 'Numrat',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  },
  {
    path: '/ankesat', label: 'Ankesat',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  },
  {
    path: '/sherbimet-shtesa', label: 'Shërbimet',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
  },
  {
    path: '/infrastruktura', label: 'Infrastruktura',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  },
  {
    path: '/chat', label: 'Chat',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  },
];

const STAFF_ITEMS = [
  {
    path: '/users', label: 'Menaxhimi i Stafit',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  },
];

const ROLE_LABELS = {
  admin:  'Admin',
  tl:     'Team Lead',
  sv:     'Supervisor',
  agent:  'Agjent',
  klient: 'Klient',
};

function NavItem({ item, onClick }) {
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
          isActive
            ? 'bg-[#7c5cdb] text-white shadow-[0_2px_8px_rgba(124,92,219,0.35)]'
            : 'text-slate-500 hover:bg-[#ede9f7] hover:text-[#7c5cdb]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#7c5cdb]'}>
            {item.icon}
          </span>
          <span className="flex-1">{item.label}</span>
          {isActive && (
            <svg className="w-3 h-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ onNavClick }) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 h-[72px] px-5 border-b border-[#f0edf8] flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c5cdb] to-[#a78bfa] flex items-center justify-center shadow-[0_2px_8px_rgba(124,92,219,0.4)]">
          <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p className="font-black text-[15px] tracking-tight text-slate-800 leading-none">TelecomMS</p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Management System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto scrollbar-hide">
        <p className="px-3 pb-1.5 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menaxhim</p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => <NavItem key={item.path} item={item} onClick={onNavClick} />)}
        </div>

        <p className="px-3 pb-1.5 pt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistem</p>
        <div className="space-y-0.5">
          {STAFF_ITEMS.map((item) => <NavItem key={item.path} item={item} onClick={onNavClick} />)}
        </div>
      </nav>

      {/* User profile footer */}
      <div className="px-3 py-3 border-t border-[#f0edf8] flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-[#f8f7fc]">
          <UserAvatar size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-slate-800 leading-tight truncate">{user?.name ?? '—'}</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
              {ROLE_LABELS[user?.roli] ?? user?.roli ?? '—'}
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white flex-shrink-0" title="Online" />
        </div>
        <p className="text-center text-[10px] text-slate-300 font-medium mt-2">v1.0.0</p>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-[220px] flex-col flex-shrink-0 border-r border-[#f0edf8]">
        <SidebarContent />
      </aside>

      {/* Mobile backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Mobile drawer */}
      <aside className={`lg:hidden fixed top-0 left-0 z-50 h-full w-[220px] flex flex-col transform transition-transform duration-300 border-r border-[#f0edf8] shadow-2xl ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-[#ede9f7] flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <SidebarContent onNavClick={onClose} />
      </aside>
    </>
  );
}
