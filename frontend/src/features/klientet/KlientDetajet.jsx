import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { klientetApi } from '../../api/klientetApi.js';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import ClientAvatar from '../../components/ui/ClientAvatar.jsx';

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'slate' }) {
  const colors = {
    slate:  'bg-slate-50  text-slate-900',
    violet: 'bg-violet-50 text-violet-700',
    green:  'bg-green-50  text-green-700',
    amber:  'bg-amber-50  text-amber-700',
    red:    'bg-red-50    text-red-700',
  };
  return (
    <div className={`rounded-2xl px-5 py-4 ${colors[color]}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <p className="text-2xl font-black leading-none">{value}</p>
      {sub && <p className="text-[11px] font-semibold mt-1 opacity-60">{sub}</p>}
    </div>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function Tab({ label, count, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors flex items-center gap-2 ${
        active ? 'bg-[#111827] text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      {label}
      {count != null && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function fmt(d) {
  return d ? new Date(d).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}
function Empty({ text }) {
  return <div className="py-16 text-center text-slate-400"><p className="text-sm font-semibold">{text}</p></div>;
}

// ─── Kontratat Tab ────────────────────────────────────────────────────────────
function KontratatTab({ kontratat }) {
  if (!kontratat.length) return <Empty text="Nuk ka kontrata." />;
  return (
    <div className="space-y-4">
      {kontratat.map((k) => (
        <div key={k.kontrate_id} className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{k.numri_kontrates}</p>
              <p className="text-[15px] font-black text-[#111827] mt-0.5">{k.paket?.emri_paketes ?? '—'}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {k.paket ? `${Number(k.paket.cmimi_mujor).toFixed(2)}€/muaj · ${k.paket.lloji_sherbimit}` : ''}
              </p>
            </div>
            <Badge value={k.statusi} />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50 rounded-xl px-4 py-3">
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Fillimi</p><p className="text-sm font-black text-slate-800">{fmt(k.data_fillimit)}</p></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Mbarimi</p><p className="text-sm font-black text-slate-800">{fmt(k.data_mbarimit)}</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {k.numrat_telefonit?.map((n) => (
              <span key={n.numri_id} className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {n.numri_telefonit}
              </span>
            ))}
            {k.sherbimet_shtesa?.map((s) => (
              <span key={s.sherbim_id} className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-[11px] font-bold px-2.5 py-1 rounded-full">+ {s.emri_sherbimit}</span>
            ))}
          </div>
          {k.faturat?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Faturat</p>
              <div className="space-y-2">
                {k.faturat.map((f) => (
                  <div key={f.fature_id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl">
                    <div><p className="text-xs font-bold text-slate-700">{f.periudha}</p><p className="text-[10px] text-slate-400">{fmt(f.data_leshimit)}</p></div>
                    <div className="flex items-center gap-3"><Badge value={f.statusi} /><p className="text-sm font-black text-slate-900">{Number(f.totali).toFixed(2)}€</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Faturat Tab ──────────────────────────────────────────────────────────────
function FaturatTab({ kontratat }) {
  const faturat = kontratat.flatMap((k) => (k.faturat ?? []).map((f) => ({ ...f, kontrate: k })))
    .sort((a, b) => new Date(b.data_leshimit) - new Date(a.data_leshimit));
  if (!faturat.length) return <Empty text="Nuk ka fatura." />;
  return (
    <div className="space-y-3">
      {faturat.map((f) => (
        <div key={f.fature_id} className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div><p className="text-sm font-black text-[#111827]">{f.periudha}</p><p className="text-[11px] text-slate-400 font-semibold mt-0.5">{f.kontrate?.numri_kontrates} · {fmt(f.data_leshimit)}</p></div>
          <div className="flex items-center gap-4"><Badge value={f.statusi} /><p className="text-base font-black text-slate-900 w-20 text-right">{Number(f.totali).toFixed(2)}€</p></div>
        </div>
      ))}
    </div>
  );
}

// ─── Numrat Tab ───────────────────────────────────────────────────────────────
function NumratTab({ kontratat }) {
  const numrat = kontratat.flatMap((k) => (k.numrat_telefonit ?? []).map((n) => ({ ...n, kontrate: k })));
  if (!numrat.length) return <Empty text="Nuk ka numra telefoni." />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {numrat.map((n) => (
        <div key={n.numri_id} className="bg-white border border-slate-100 rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between"><p className="text-base font-black text-[#111827]">{n.numri_telefonit}</p><Badge value={n.statusi} /></div>
          <div className="flex items-center gap-3 mt-2"><Badge value={n.lloji} /><p className="text-[11px] text-slate-400">{n.kontrate?.numri_kontrates}</p></div>
          {n.data_aktivizimit && <p className="text-[11px] text-slate-400 mt-1">Aktivizuar: {fmt(n.data_aktivizimit)}</p>}
        </div>
      ))}
    </div>
  );
}

// ─── Llogaria Tab ─────────────────────────────────────────────────────────────
function LlogariaTab({ klient, onTogglePortal }) {
  const { user } = klient;
  if (!user) return <Empty text="Ky klient nuk ka llogari portali." />;
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-black text-[#111827]">Llogaria e Portalit</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${user.aktiv ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${user.aktiv ? 'bg-violet-500' : 'bg-slate-400'}`} />
          {user.aktiv ? 'Aktiv' : 'Joaktiv'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl px-4 py-3 mb-5">
        <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Email hyrje</p><p className="text-sm font-black text-slate-800">{user.email}</p></div>
        <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Hyrja e fundit</p><p className="text-sm font-black text-slate-800">{fmt(user.last_login_at)}</p></div>
      </div>

      <button
        onClick={onTogglePortal}
        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${
          user.aktiv
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            : 'bg-violet-700 hover:bg-violet-800 text-white'
        }`}
      >
        {user.aktiv ? 'Çaktivizo qasjen në portal' : 'Aktivizo qasjen në portal'}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = ['Kontratat', 'Faturat', 'Numrat', 'Llogaria'];

export default function KlientDetajet() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const [tab, setTab] = useState('Kontratat');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['klient-detail', id],
    queryFn:  () => klientetApi.detail(id).then((r) => r.data),
  });

  const togglePortal = useMutation({
    mutationFn: (aktiv) => klientetApi.update(id, { portal_aktiv: aktiv }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['klient-detail', id] }),
  });

  if (isLoading) return <div className="flex justify-center items-center py-32"><Spinner className="w-10 h-10" /></div>;
  if (isError)   return <div className="flex justify-center items-center py-32 text-slate-500"><p className="text-sm">Ndodhi një gabim. Provo sërish.</p></div>;

  const { klient, kontratat, summary } = data;

  return (
    <div>
      {/* Back */}
      <button onClick={() => navigate('/klientet')}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Klientët
      </button>

      {/* Header */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <ClientAvatar lloji={klient.lloji_klientit} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-[#111827]">{klient.emri} {klient.mbiemri}</h1>
              <Badge value={klient.statusi} />
              <Badge value={klient.lloji_klientit} />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 font-medium">
              <span>{klient.email}</span>
              <span>{klient.telefoni}</span>
              <span>ID: {klient.numri_personal}</span>
              {klient.adresa && <span>{klient.adresa}</span>}
              <span>Regjistruar: {fmt(klient.data_regjistrimit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard label="Kontrata"        value={summary.total_kontrata}               color="slate"  />
        <StatCard label="Aktive"          value={summary.kontrata_aktive}              color="violet" />
        <StatCard label="Numra Tel."      value={summary.total_numra}                  color="slate"  />
        <StatCard label="Shërbime"        value={summary.sherbimet_shtesa}             color="slate"  />
        <StatCard label="Borxhi"          value={`${summary.total_borxh.toFixed(2)}€`} sub="i papaguar" color={summary.total_borxh > 0 ? 'red' : 'green'} />
        <StatCard label="Total Paguar"    value={`${summary.total_paguar.toFixed(2)}€`}               color="green"  />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <Tab key={t} label={t} active={tab === t}
            count={
              t === 'Kontratat' ? summary.total_kontrata :
              t === 'Faturat'   ? kontratat.flatMap((k) => k.faturat ?? []).length :
              t === 'Numrat'    ? summary.total_numra : null
            }
            onClick={() => setTab(t)}
          />
        ))}
      </div>

      {tab === 'Kontratat' && <KontratatTab kontratat={kontratat} />}
      {tab === 'Faturat'   && <FaturatTab   kontratat={kontratat} />}
      {tab === 'Numrat'    && <NumratTab    kontratat={kontratat} />}
      {tab === 'Llogaria'  && (
        <LlogariaTab
          klient={klient}
          onTogglePortal={() => togglePortal.mutate(!klient.user?.aktiv)}
        />
      )}
    </div>
  );
}
