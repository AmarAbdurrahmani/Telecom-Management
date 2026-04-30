import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../api/axios.js';
import Spinner from '../components/ui/Spinner.jsx';
import AntennaMap from '../components/ui/AntennaMap.jsx';

// ─── Sparkline bars ───────────────────────────────────────────────────────────
function Sparkline({ values = [], color = '#7c5cdb' }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-[3px] h-8">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-700"
          style={{ height: `${Math.max(8, (v / max) * 100)}%`, background: color, opacity: 0.4 + 0.6 * (i / values.length) }}
        />
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, accent, warning, sparkValues, delay = 0 }) {
  const base   = 'rounded-2xl p-4 flex flex-col gap-3';
  const theme  = accent  ? 'bg-gradient-to-br from-[#7c5cdb] to-[#a78bfa] text-white shadow-[0_4px_20px_rgba(124,92,219,0.35)]'
               : warning ? 'bg-white border border-red-100'
               : 'bg-white border border-[#f0edf8]';

  return (
    <div className={`${base} ${theme} animate-fade-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accent ? 'bg-white/20' : warning ? 'bg-red-50 text-red-500' : 'bg-[#ede9f7] text-[#7c5cdb]'}`}>
          {icon}
        </div>
        {sparkValues && (
          <Sparkline values={sparkValues} color={accent ? '#fff' : warning ? '#ef4444' : '#7c5cdb'} />
        )}
      </div>
      <div>
        <p className={`text-[11px] font-bold uppercase tracking-widest ${accent ? 'text-white/70' : warning ? 'text-red-400' : 'text-slate-400'}`}>{label}</p>
        <p className={`text-[26px] font-black leading-none mt-0.5 ${accent ? 'text-white' : warning ? 'text-red-700' : 'text-slate-900'}`}>{value ?? '—'}</p>
        {sub && <p className={`text-[11px] font-medium mt-1 ${accent ? 'text-white/60' : warning ? 'text-red-400' : 'text-slate-400'}`}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
function ChartTip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e293b] rounded-xl px-3 py-2 shadow-xl border border-white/10">
      <p className="text-[10px] text-white/50 font-bold uppercase mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-[13px] font-black" style={{ color: p.color }}>
          {p.name}: {currency ? `${Number(p.value).toFixed(0)}€` : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Type Bars ────────────────────────────────────────────────────────────────
function TypeBars({ data }) {
  if (!data?.length) return <p className="text-sm text-slate-400 text-center py-4">Nuk ka të dhëna.</p>;
  const total  = data.reduce((s, d) => s + d.total, 0) || 1;
  const COLORS = { individual: '#7c5cdb', biznes: '#5b21b6', vip: '#f59e0b' };
  return (
    <div className="space-y-3.5">
      {data.map((d) => (
        <div key={d.lloji}>
          <div className="flex items-center justify-between text-[12px] font-bold text-slate-600 mb-1.5">
            <span className="capitalize">{d.lloji}</span>
            <span className="tabular-nums">{d.total} <span className="text-slate-400 font-normal">({Math.round(d.total / total * 100)}%)</span></span>
          </div>
          <div className="h-1.5 bg-[#ede9f7] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(d.total / total) * 100}%`, background: COLORS[d.lloji] ?? '#7c5cdb', transition: 'width 0.8s ease' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Activity list ────────────────────────────────────────────────────────────
const STATUS_DOT = { e_paguar: 'bg-emerald-500', e_papaguar: 'bg-amber-400', e_vonuar: 'bg-red-500', aktiv: 'bg-violet-500' };

function ActivityList({ items }) {
  if (!items?.length) return <p className="text-sm text-slate-400 py-4 text-center">Nuk ka aktivitet.</p>;
  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-[#f8f7fc] last:border-0">
          <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[item.statusi] ?? 'bg-slate-300'}`} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-slate-800 leading-tight truncate">{item.text}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard Search Trigger ─────────────────────────────────────────────────
function SearchBar() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('open-global-search'))}
      className="w-full flex items-center gap-3 px-4 py-2.5 bg-white border border-[#f0edf8] rounded-xl text-left hover:border-[#7c5cdb]/30 hover:shadow-sm transition-all group"
    >
      <svg className="w-4 h-4 text-slate-400 group-hover:text-[#7c5cdb] flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
      </svg>
      <span className="flex-1 text-[13px] font-medium text-slate-400 group-hover:text-slate-500 transition-colors">
        Kërko klientin, faturën…
      </span>
      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300">
        <kbd className="px-1.5 py-0.5 rounded bg-[#f0edf8] border border-[#e9e5f5]">Ctrl</kbd>
        <span>K</span>
      </div>
    </button>
  );
}

// ─── SIM Card visual ─────────────────────────────────────────────────────────
const SIM_TYPES = [
  { label: 'Standard SIM', color: 'from-[#7c5cdb] to-[#5b21b6]', chip: '#a78bfa' },
  { label: 'Micro SIM',    color: 'from-[#1e293b] to-[#334155]', chip: '#64748b' },
  { label: 'Nano SIM',     color: 'from-[#059669] to-[#047857]', chip: '#34d399' },
];

function SimCard({ label, color, chip, index }) {
  return (
    <div className={`relative rounded-2xl p-4 bg-gradient-to-br ${color} text-white overflow-hidden animate-fade-up h-[110px] flex flex-col justify-between`}
      style={{ animationDelay: `${300 + index * 100}ms` }}>
      {/* Chip */}
      <div className="w-8 h-6 rounded-md" style={{ background: chip, opacity: 0.9 }}>
        <div className="w-full h-full rounded-md border-2 border-white/20 grid grid-cols-2 gap-px p-0.5">
          {[...Array(4)].map((_, i) => <div key={i} className="rounded-sm bg-white/30" />)}
        </div>
      </div>
      {/* Network logo */}
      <div className="flex items-end justify-between">
        <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{label}</p>
        <div className="flex gap-0.5 items-end">
          {[3, 5, 7, 9].map((h, i) => (
            <div key={i} className="w-1 rounded-sm bg-white/50" style={{ height: h }} />
          ))}
        </div>
      </div>
      {/* Decorative circles */}
      <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/5" />
      <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white/5" />
    </div>
  );
}

// ─── Network stat row ─────────────────────────────────────────────────────────
function NetStat({ label, value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-[12px] font-bold text-slate-600 mb-1">
        <span>{label}</span>
        <span className="tabular-nums" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 bg-[#ede9f7] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

// ─── Quick actions ────────────────────────────────────────────────────────────
const QUICK = [
  { label: 'Klient i ri',    path: '/klientet',         bg: 'bg-[#ede9f7] hover:bg-violet-100', fg: 'text-[#7c5cdb]' },
  { label: 'Kontratë e re',  path: '/kontratat',        bg: 'bg-[#f0fdf4] hover:bg-emerald-100', fg: 'text-emerald-700' },
  { label: 'Faturë e re',    path: '/faturat',          bg: 'bg-[#fff7ed] hover:bg-orange-100',  fg: 'text-orange-600' },
  { label: 'Numër telefonit',path: '/numrat-telefonit', bg: 'bg-[#f0f9ff] hover:bg-sky-100',     fg: 'text-sky-600'    },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn:  () => api.get('/dashboard/stats').then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Spinner className="w-8 h-8" /></div>;
  }

  const { kpis, revenue, new_clients, by_type, activity } = data ?? {};

  // Sparkline values from revenue (total field)
  const revenueSparkline  = (revenue ?? []).slice(-6).map((r) => r.total ?? 0);
  const clientsSparkline  = (new_clients ?? []).slice(-6).map((r) => r.total ?? 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_260px] gap-5">

      {/* ══ LEFT COLUMN ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-4">

        {/* KPI cards */}
        <KpiCard
          label="Klientë gjithsej"
          value={kpis?.total_klientet}
          sub={`${kpis?.klientet_aktiv ?? 0} aktivë`}
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          accent
          sparkValues={clientsSparkline}
          delay={0}
        />
        <KpiCard
          label="Faturat e muajit"
          value={kpis?.faturat_muajit}
          sub="muaji aktual"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>}
          sparkValues={revenueSparkline}
          delay={80}
        />
        <KpiCard
          label="Borxhi total"
          value={kpis?.borxhi_total != null ? `${Number(kpis.borxhi_total).toFixed(0)}€` : '—'}
          sub="e papaguar"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          warning={kpis?.borxhi_total > 0}
          delay={160}
        />
        <KpiCard
          label="Numra aktivë"
          value={kpis?.numrat_aktiv}
          sub="linja aktive"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
          delay={240}
        />

        {/* Client types */}
        <div className="bg-white border border-[#f0edf8] rounded-2xl p-4 animate-fade-up" style={{ animationDelay: '320ms' }}>
          <p className="text-[13px] font-black text-slate-800 mb-3">Klientët sipas llojit</p>
          <TypeBars data={by_type} />
        </div>

        {/* Network stats */}
        <div className="bg-white border border-[#f0edf8] rounded-2xl p-4 animate-fade-up" style={{ animationDelay: '400ms' }}>
          <p className="text-[13px] font-black text-slate-800 mb-3">Statistika rrjeti</p>
          <div className="space-y-3">
            <NetStat label="Aktivitet"  value={kpis?.klientet_aktiv ?? 0}  max={kpis?.total_klientet || 1}  color="#7c5cdb" />
            <NetStat label="Linja SIM"  value={kpis?.numrat_aktiv ?? 0}    max={Math.max(kpis?.numrat_aktiv ?? 0, 1) * 1.2}  color="#059669" />
            <NetStat label="Borxh / Total" value={kpis?.faturat_muajit ?? 0} max={Math.max(kpis?.faturat_muajit ?? 0, 1) * 1.5} color="#f59e0b" />
          </div>
        </div>
      </div>

      {/* ══ MIDDLE COLUMN ════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-4 min-w-0">

        {/* Search */}
        <div className="animate-fade-up" style={{ animationDelay: '50ms' }}>
          <SearchBar />
        </div>

        {/* Revenue chart */}
        <div className="bg-white border border-[#f0edf8] rounded-2xl p-5 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[14px] font-black text-slate-800 leading-none">Faturat 6 muajt e fundit</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Total · Paguar · Borxh (€)</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#7c5cdb] animate-pulse" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenue} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f8f7fc" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<ChartTip currency />} />
              <Bar dataKey="total"  name="Total"  fill="#7c5cdb" radius={[4,4,0,0]} />
              <Bar dataKey="paguar" name="Paguar" fill="#a78bfa" radius={[4,4,0,0]} />
              <Bar dataKey="borxh"  name="Borxh"  fill="#fca5a5" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* New clients chart */}
        <div className="bg-white border border-[#f0edf8] rounded-2xl p-5 animate-fade-up" style={{ animationDelay: '180ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[14px] font-black text-slate-800 leading-none">Klientë të rinj</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Regjistruar 6 muajt e fundit</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={new_clients}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f8f7fc" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<ChartTip />} />
              <Line
                type="monotone" dataKey="total" name="Klientë të rinj"
                stroke="#7c5cdb" strokeWidth={2.5}
                dot={{ fill: '#7c5cdb', r: 3 }}
                activeDot={{ r: 5, fill: '#5b21b6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* SIM card showcase */}
        <div className="bg-white border border-[#f0edf8] rounded-2xl p-4 animate-fade-up" style={{ animationDelay: '260ms' }}>
          <p className="text-[13px] font-black text-slate-800 mb-3">Kartelat SIM</p>
          <div className="grid grid-cols-3 gap-3">
            {SIM_TYPES.map((s, i) => <SimCard key={s.label} {...s} index={i} />)}
          </div>
        </div>

        {/* Client type pie chart */}
        <div className="bg-white border border-[#f0edf8] rounded-2xl p-5 animate-fade-up" style={{ animationDelay: '340ms' }}>
          <p className="text-[14px] font-black text-slate-800 mb-4">Shperndarja e klienteve</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={(by_type ?? []).map(d => ({ name: d.lloji, value: d.total }))}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {(by_type ?? []).map((d, i) => (
                  <Cell key={d.lloji} fill={['#7c5cdb', '#5b21b6', '#f59e0b'][i % 3]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ══ RIGHT COLUMN ═════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-4">

        {/* Antenna Map — B&W Leaflet with 5G + LTE antennas */}
        <div className="bg-white border border-[#f0edf8] rounded-2xl overflow-hidden animate-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f8f7fc]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[13px] font-black text-slate-800">Harta e antenave</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-[#f8f7fc] px-2 py-0.5 rounded-full">5G + LTE · Kosovo</span>
          </div>
          <AntennaMap height={420} />
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-[#f0edf8] rounded-2xl p-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <p className="text-[13px] font-black text-slate-800 mb-3">Veprime të shpejta</p>
          <div className="space-y-2">
            {QUICK.map((a) => (
              <button key={a.path} onClick={() => navigate(a.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${a.bg} ${a.fg}`}>
                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {a.label}
                <svg className="w-3.5 h-3.5 ml-auto opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white border border-[#f0edf8] rounded-2xl p-4 animate-fade-up flex-1" style={{ animationDelay: '280ms' }}>
          <p className="text-[13px] font-black text-slate-800 mb-1">Aktiviteti i fundit</p>
          <p className="text-[11px] text-slate-400 mb-3">Faturat dhe klientët e rinj</p>
          <ActivityList items={activity} />
        </div>
      </div>

    </div>
  );
}
