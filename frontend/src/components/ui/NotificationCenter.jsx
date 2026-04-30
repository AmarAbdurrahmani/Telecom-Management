import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';

// ─── Role-based notification templates ────────────────────────────────────────
const ROLE_NOTIFS = {
  admin: [
    { id: 1, type: 'warning', title: 'Borxh i lartë', body: '3 klientë kanë borxh mbi 100€', path: '/faturat?statusi=e_vonuar', time: '5 min' },
    { id: 2, type: 'info',    title: 'Staf i ri',     body: 'Agjenti Eron Leka u shtua në sistem', path: '/users', time: '1 orë' },
    { id: 3, type: 'success', title: 'Pagesë hyrëse',  body: 'Fatura #1082 u pagua (29.99€)', path: '/pagesat', time: '2 orë' },
    { id: 4, type: 'warning', title: 'Kontratat skaduese', body: '5 kontrata skadojnë brenda 30 ditëve', path: '/lifecycle', time: '1 ditë' },
    { id: 5, type: 'info',    title: 'Ankesë e re',    body: 'Klienti Arta Gashi hapi ankesë', path: '/ankesat', time: '2 ditë' },
  ],
  tl: [
    { id: 1, type: 'warning', title: 'Ankesa të hapura', body: '7 ankesa presin përgjigje', path: '/ankesat', time: '10 min' },
    { id: 2, type: 'success', title: 'Objektiv i arritur', body: 'Ekipi arriti 120% të targetit mujor', path: '/dashboard', time: '3 orë' },
    { id: 3, type: 'info',    title: 'Raport javor', body: 'Raporti i javës së kaluar është gati', path: '/dashboard', time: '1 ditë' },
  ],
  sv: [
    { id: 1, type: 'warning', title: 'Ankesa të papërgjigjura', body: '4 ankesa nuk janë mbyllur', path: '/ankesat', time: '30 min' },
    { id: 2, type: 'info',    title: 'Klient i ri', body: 'U regjistrua klient i ri: Arben Hoxha', path: '/klientet', time: '2 orë' },
    { id: 3, type: 'success', title: 'Mirëmbajtje e suksesshme', body: 'Stacioni BS-041 u mirëmbajtë', path: '/infrastruktura', time: '1 ditë' },
  ],
  agent: [
    { id: 1, type: 'info',    title: 'Detyrë e re',   body: 'Ti je caktuar në ankesën #A-209', path: '/ankesat', time: '15 min' },
    { id: 2, type: 'warning', title: 'Skadim kontrate', body: 'Kontrata e klientit Mirel Shala skadon nesër', path: '/lifecycle', time: '1 orë' },
    { id: 3, type: 'success', title: 'Pagesë e regjistruar', body: 'Pagesa e klientit Lira Dema u konfirmua', path: '/pagesat', time: '3 orë' },
  ],
};

const TYPE_STYLES = {
  success: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', icon: '✓' },
  warning: { dot: 'bg-amber-500',   bg: 'bg-amber-50',   icon: '!' },
  info:    { dot: 'bg-violet-500',  bg: 'bg-[#ede9f7]',  icon: 'i' },
  error:   { dot: 'bg-red-500',     bg: 'bg-red-50',     icon: '✕' },
};

export default function NotificationCenter() {
  const [open, setOpen]   = useState(false);
  const [read, setRead]   = useState(new Set());
  const wrapRef           = useRef(null);
  const navigate          = useNavigate();
  const { user }          = useAuthStore();

  const roli  = user?.roli ?? 'agent';
  const notifs = ROLE_NOTIFS[roli] ?? ROLE_NOTIFS.agent;
  const unread = notifs.filter((n) => !read.has(n.id)).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleClick(n) {
    setRead((prev) => new Set([...prev, n.id]));
    setOpen(false);
    if (n.path) navigate(n.path);
  }

  function markAllRead() {
    setRead(new Set(notifs.map((n) => n.id)));
  }

  return (
    <div ref={wrapRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-xl bg-[#1e293b] flex items-center justify-center text-white/70 hover:text-white transition-colors relative"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#f0edf8] z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f8f7fc]">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-black text-slate-800">Njoftimet</p>
              {unread > 0 && (
                <span className="bg-[#ede9f7] text-[#7c5cdb] text-[10px] font-black px-2 py-0.5 rounded-full">
                  {unread} të reja
                </span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-[11px] font-bold text-[#7c5cdb] hover:underline">
                Shëno të gjitha
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto scrollbar-hide divide-y divide-[#f8f7fc]">
            {notifs.map((n) => {
              const style  = TYPE_STYLES[n.type] ?? TYPE_STYLES.info;
              const isRead = read.has(n.id);
              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-[#f8f7fc] transition-colors text-left ${isRead ? 'opacity-60' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[13px] font-bold leading-tight ${isRead ? 'text-slate-500' : 'text-slate-800'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap flex-shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.body}</p>
                  </div>
                  {!isRead && <div className="w-2 h-2 rounded-full bg-[#7c5cdb] flex-shrink-0 mt-1.5" />}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-[#f8f7fc] text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              {roli === 'admin' ? 'Njoftimet e sistemit' : 'Njoftimet e tua personale'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
