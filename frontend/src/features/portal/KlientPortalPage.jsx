import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(d) {
  return d
    ? new Date(d).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  e_paguar:   'bg-green-500/20 text-green-400 border border-green-500/30',
  e_papaguar: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  e_vonuar:   'bg-red-500/20   text-red-400   border border-red-500/30',
};
const STATUS_LABELS = {
  e_paguar:   'E paguar',
  e_papaguar: 'E papaguar',
  e_vonuar:   'E vonuar',
};

function FatureStatus({ statusi }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${STATUS_STYLES[statusi] ?? 'bg-white/10 text-white/50'}`}>
      {STATUS_LABELS[statusi] ?? statusi}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'default' }) {
  const colors = {
    default: 'bg-white/5 border-white/10 text-white',
    red:     'bg-red-500/10 border-red-500/30 text-red-300',
    green:   'bg-green-500/10 border-green-500/30 text-green-300',
    blue:    'bg-blue-500/10 border-blue-500/30 text-blue-300',
  };
  return (
    <div className={`rounded-2xl px-5 py-4 border ${colors[color]}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <p className="text-2xl font-black leading-none">{value}</p>
      {sub && <p className="text-[11px] font-semibold mt-1 opacity-60">{sub}</p>}
    </div>
  );
}

// ─── Invoice row ─────────────────────────────────────────────────────────────
function FatureRow({ fature, kontrate }) {
  const isUnpaid = fature.statusi !== 'e_paguar';
  return (
    <div className={`rounded-2xl border p-5 transition-colors ${
      isUnpaid
        ? fature.statusi === 'e_vonuar'
          ? 'bg-red-500/5 border-red-500/20'
          : 'bg-amber-500/5 border-amber-500/20'
        : 'bg-white/5 border-white/10'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-base font-black text-white">{fature.periudha}</p>
            <FatureStatus statusi={fature.statusi} />
          </div>
          <p className="text-xs text-white/40 font-medium">
            {kontrate?.numri_kontrates} · Lëshuar {fmt(fature.data_leshimit)}
            {fature.data_pageses && ` · Paguar ${fmt(fature.data_pageses)}`}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-xl font-black ${isUnpaid ? fature.statusi === 'e_vonuar' ? 'text-red-400' : 'text-amber-400' : 'text-white'}`}>
            {Number(fature.totali).toFixed(2)}€
          </p>
          {isUnpaid && (
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-0.5">borxh</p>
          )}
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Baza</p>
          <p className="text-sm font-black text-white/70">{Number(fature.shuma_baze).toFixed(2)}€</p>
        </div>
        <div>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Shtesë</p>
          <p className="text-sm font-black text-white/70">{Number(fature.shuma_shtese ?? 0).toFixed(2)}€</p>
        </div>
        <div>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">TVSH</p>
          <p className="text-sm font-black text-white/70">{Number(fature.tatimi ?? 0).toFixed(2)}€</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KlientPortalPage() {
  const [tab, setTab] = useState('borxhi'); // 'borxhi' | 'te_gjitha' | 'kontratat'

  const { data, isLoading, isError } = useQuery({
    queryKey: ['portal'],
    queryFn: () => api.get('/auth/portal').then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner className="w-10 h-10 text-white/30" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-32 text-center text-white/40">
        <p className="text-sm font-medium">Ndodhi një gabim. Provo sërish.</p>
      </div>
    );
  }

  const { klient, kontratat, summary } = data;

  // All invoices flat list
  const tgjitha = kontratat
    .flatMap((k) => (k.faturat ?? []).map((f) => ({ ...f, _kontrate: k })))
    .sort((a, b) => new Date(b.data_leshimit) - new Date(a.data_leshimit));

  const borxhi  = tgjitha.filter((f) => f.statusi !== 'e_paguar');
  const paguar  = tgjitha.filter((f) => f.statusi === 'e_paguar');

  const initials = `${klient.emri.charAt(0)}${klient.mbiemri.charAt(0)}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* ── Client header ── */}
      <div className="bg-white/5 border border-white/10 rounded-[24px] p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{klient.emri} {klient.mbiemri}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-white/50 font-medium mt-1">
              <span>{klient.email}</span>
              <span>{klient.telefoni}</span>
              {klient.adresa && <span>{klient.adresa}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Borxhi total"
          value={`${summary.total_borxh.toFixed(2)}€`}
          sub={borxhi.length ? `${borxhi.length} faturë` : 'pa borxh'}
          color={summary.total_borxh > 0 ? 'red' : 'green'}
        />
        <StatCard
          label="Total paguar"
          value={`${summary.total_paguar.toFixed(2)}€`}
          sub={`${paguar.length} faturë`}
          color="green"
        />
        <StatCard
          label="Kontrata"
          value={summary.total_kontrata}
          sub={`${summary.kontrata_aktive} aktive`}
          color="blue"
        />
        <StatCard
          label="Të gjitha faturat"
          value={tgjitha.length}
          sub={`totali ${summary.total_fatura.toFixed(2)}€`}
        />
      </div>

      {/* ── Debt highlight (if any) ── */}
      {summary.total_borxh > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-black text-red-300">Borxh i papaguar</p>
            <p className="text-xs text-red-400/70 mt-0.5">
              Ju keni {borxhi.length} faturë të papaguara me vlerë totale{' '}
              <span className="font-black">{summary.total_borxh.toFixed(2)}€</span>.
              Ju lutemi kryeni pagesën sa më shpejt.
            </p>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: 'borxhi',    label: 'Borxhi',       count: borxhi.length   },
          { key: 'te_gjitha', label: 'Të gjitha',    count: tgjitha.length  },
          { key: 'kontratat', label: 'Kontratat',     count: kontratat.length},
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-colors ${
              tab === t.key
                ? 'bg-white text-slate-900'
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              tab === t.key ? 'bg-slate-900/20' : 'bg-white/10'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}

      {/* Borxhi tab */}
      {tab === 'borxhi' && (
        borxhi.length === 0
          ? (
            <div className="py-16 text-center text-white/30">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold">Nuk keni borxh! Të gjitha faturat janë paguar.</p>
            </div>
          )
          : (
            <div className="space-y-3">
              {borxhi.map((f) => (
                <FatureRow key={f.fature_id} fature={f} kontrate={f._kontrate} />
              ))}
            </div>
          )
      )}

      {/* Te gjitha tab */}
      {tab === 'te_gjitha' && (
        <div className="space-y-3">
          {tgjitha.map((f) => (
            <FatureRow key={f.fature_id} fature={f} kontrate={f._kontrate} />
          ))}
        </div>
      )}

      {/* Kontratat tab */}
      {tab === 'kontratat' && (
        <div className="space-y-4">
          {kontratat.map((k) => (
            <div key={k.kontrate_id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider">{k.numri_kontrates}</p>
                  <p className="text-base font-black text-white mt-0.5">
                    {k.paket?.emri_paketes ?? '—'}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {k.paket ? `${Number(k.paket.cmimi_mujor).toFixed(2)}€/muaj · ${k.paket.lloji_sherbimit}` : ''}
                  </p>
                </div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0 ${
                  k.statusi === 'aktive'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/10 text-white/40 border border-white/20'
                }`}>
                  {k.statusi}
                </span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 bg-white/5 rounded-xl px-4 py-3 mb-4">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Fillimi</p>
                  <p className="text-sm font-black text-white">{fmt(k.data_fillimit)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Mbarimi</p>
                  <p className="text-sm font-black text-white">{fmt(k.data_mbarimit)}</p>
                </div>
              </div>

              {/* Numbers */}
              {k.numrat_telefonit?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {k.numrat_telefonit.map((n) => (
                    <span key={n.numri_id} className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-bold px-3 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {n.numri_telefonit}
                    </span>
                  ))}
                </div>
              )}

              {/* Invoice summary for this contract */}
              {k.faturat?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Faturat</p>
                  <div className="space-y-2">
                    {k.faturat.map((f) => (
                      <div key={f.fature_id} className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/5">
                        <div>
                          <p className="text-xs font-bold text-white">{f.periudha}</p>
                          <p className="text-[10px] text-white/40">{fmt(f.data_leshimit)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <FatureStatus statusi={f.statusi} />
                          <p className="text-sm font-black text-white w-16 text-right">{Number(f.totali).toFixed(2)}€</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
