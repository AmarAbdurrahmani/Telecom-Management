import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios.js';
import ClientAvatar from './ClientAvatar.jsx';

// ─── Status styles ────────────────────────────────────────────────────────────
const STATUS_CLS = {
  aktiv:     'bg-emerald-100 text-emerald-700',
  pezulluar: 'bg-amber-100 text-amber-700',
  joaktiv:   'bg-slate-100 text-slate-500',
};

// ─── Quick nav links (always shown when no query) ─────────────────────────────
const QUICK_LINKS = [
  { label: 'Klientët',          path: '/klientet',          icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'Kontratat',         path: '/kontratat',         icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: 'Faturat',           path: '/faturat',           icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
  { label: 'Ankesat',           path: '/ankesat',           icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
  { label: 'Numrat e Telefonit',path: '/numrat-telefonit',  icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
  { label: 'Infrastruktura',    path: '/infrastruktura',    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
];

export default function GlobalSearch({ open, onClose }) {
  const navigate                    = useNavigate();
  const [q, setQ]                   = useState('');
  const [activeIdx, setActiveIdx]   = useState(0);
  const inputRef                    = useRef(null);
  const listRef                     = useRef(null);

  // ── Reset state when modal opens ──────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setQ('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // ── API query ─────────────────────────────────────────────────────────────
  const { data, isFetching } = useQuery({
    queryKey:  ['global-search', q],
    queryFn:   () => api.get('/klientet', { params: { search: q, per_page: 10 } }).then((r) => r.data),
    enabled:   open && q.trim().length >= 1,
    staleTime: 15_000,
  });

  const clients = data?.data ?? [];

  // ── Items for keyboard nav ─────────────────────────────────────────────────
  const items = q.trim().length >= 1 ? clients : QUICK_LINKS;

  // ── Keyboard handling ─────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (!open) return;
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, items.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && items.length > 0) {
      e.preventDefault();
      const item = items[activeIdx];
      if (item) {
        if (q.trim().length >= 1) {
          // client result
          navigate(`/klientet/${item.hash_id}`);
        } else {
          navigate(item.path);
        }
        onClose();
      }
    }
  }, [open, items, activeIdx, q, navigate, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset active when results change
  useEffect(() => { setActiveIdx(0); }, [q]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIdx];
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4"
      style={{ background: 'rgba(15,10,30,0.55)', backdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.25)] overflow-hidden animate-fade-up">

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#f0edf8]">
          <svg className="w-5 h-5 text-[#7c5cdb] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Kërko klientin, faturën, kontratën…"
            className="flex-1 bg-transparent text-[15px] font-medium text-slate-800 placeholder-slate-400 outline-none"
          />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isFetching && (
              <span className="w-4 h-4 border-2 border-slate-200 border-t-[#7c5cdb] rounded-full animate-spin block" />
            )}
            <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#f8f7fc] border border-[#e9e5f5] text-[10px] font-bold text-slate-400">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto scrollbar-hide" ref={listRef}>

          {/* Quick nav (when empty query) */}
          {q.trim().length < 1 && (
            <>
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navigim i shpejtë</p>
              </div>
              {QUICK_LINKS.map((link, i) => (
                <button
                  key={link.path}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => { navigate(link.path); onClose(); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${activeIdx === i ? 'bg-[#ede9f7]' : 'hover:bg-[#f8f7fc]'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${activeIdx === i ? 'bg-[#7c5cdb]' : 'bg-[#f0edf8]'}`}>
                    <svg className={`w-4 h-4 ${activeIdx === i ? 'text-white' : 'text-[#7c5cdb]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                    </svg>
                  </div>
                  <span className={`text-[13px] font-bold ${activeIdx === i ? 'text-[#7c5cdb]' : 'text-slate-700'}`}>{link.label}</span>
                  <svg className={`w-3.5 h-3.5 ml-auto opacity-40 ${activeIdx === i ? 'text-[#7c5cdb]' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </>
          )}

          {/* Client search results */}
          {q.trim().length >= 1 && (
            <>
              {clients.length === 0 && !isFetching ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#f0edf8] flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-[#7c5cdb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                    </svg>
                  </div>
                  <p className="text-[13px] font-bold text-slate-500">Nuk u gjet asnjë rezultat</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Provo me fjalë të tjera</p>
                </div>
              ) : (
                <>
                  <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klientët</p>
                    {clients.length > 0 && (
                      <button
                        onClick={() => { navigate(`/klientet?search=${encodeURIComponent(q)}`); onClose(); }}
                        className="text-[10px] font-bold text-[#7c5cdb] hover:underline"
                      >
                        Shiko të gjitha →
                      </button>
                    )}
                  </div>
                  {clients.map((k, i) => (
                    <button
                      key={k.klient_id}
                      onMouseEnter={() => setActiveIdx(i)}
                      onClick={() => { navigate(`/klientet/${k.hash_id}`); onClose(); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left group ${activeIdx === i ? 'bg-[#ede9f7]' : 'hover:bg-[#f8f7fc]'}`}
                    >
                      <ClientAvatar lloji={k.lloji_klientit} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-bold leading-tight truncate ${activeIdx === i ? 'text-[#7c5cdb]' : 'text-slate-800'}`}>
                          {k.emri} {k.mbiemri}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{k.email} · {k.telefoni}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${STATUS_CLS[k.statusi] ?? STATUS_CLS.joaktiv}`}>
                          {k.statusi}
                        </span>
                        <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-[#f8f7fc] flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <kbd className="px-1 py-0.5 rounded bg-[#f0edf8] border border-[#e9e5f5] font-bold">↑↓</kbd>
            navigim
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <kbd className="px-1 py-0.5 rounded bg-[#f0edf8] border border-[#e9e5f5] font-bold">↵</kbd>
            hap
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <kbd className="px-1 py-0.5 rounded bg-[#f0edf8] border border-[#e9e5f5] font-bold">ESC</kbd>
            mbyll
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <kbd className="px-1 py-0.5 rounded bg-[#f0edf8] border border-[#e9e5f5] font-bold">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1 py-0.5 rounded bg-[#f0edf8] border border-[#e9e5f5] font-bold">K</kbd>
            kudo
          </div>
        </div>
      </div>
    </div>
  );
}
