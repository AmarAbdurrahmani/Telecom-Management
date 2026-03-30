import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../api/axios.js';
import Spinner from '../components/ui/Spinner.jsx';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STAT_ICONS = {
  clients: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  invoice: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
    </svg>
  ),
  unpaid: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  phone: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, iconKey, accent = false, warning = false }) {
  return (
    <div className={`rounded-2xl p-5 flex items-center gap-4 ${
      accent  ? 'bg-violet-700 text-white' :
      warning ? 'bg-red-50 border border-red-100' :
      'bg-white border border-slate-100'
    }`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
        accent  ? 'bg-white/15' :
        warning ? 'bg-red-100 text-red-600' :
        'bg-violet-50 text-violet-700'
      }`}>
        {STAT_ICONS[iconKey]}
      </div>
      <div className="min-w-0">
        <p className={`text-[11px] font-bold uppercase tracking-widest mb-0.5 ${accent ? 'text-white/70' : warning ? 'text-red-400' : 'text-slate-500'}`}>{label}</p>
        <p className={`text-2xl font-black leading-none ${accent ? 'text-white' : warning ? 'text-red-700' : 'text-[#111827]'}`}>{value ?? '—'}</p>
        {sub && <p className={`text-[11px] font-medium mt-0.5 ${accent ? 'text-white/60' : warning ? 'text-red-400' : 'text-slate-400'}`}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111827] rounded-xl px-3 py-2 shadow-xl border border-white/10">
      <p className="text-[11px] text-white/50 font-bold uppercase mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm font-black" style={{ color: p.color }}>
          {p.name}: {currency ? `${Number(p.value).toFixed(0)}€` : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Activity Icon ────────────────────────────────────────────────────────────
const STATUS_DOT = {
  e_paguar:   'bg-green-500',
  e_papaguar: 'bg-amber-500',
  e_vonuar:   'bg-red-500',
  aktiv:      'bg-violet-500',
};

function ActivityList({ items }) {
  if (!items?.length) return <p className="text-sm text-slate-400 py-4 text-center">Nuk ka aktivitet.</p>;
  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
          <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[item.statusi] ?? 'bg-slate-300'}`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#111827] leading-tight truncate">{item.text}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'Klient i ri',    path: '/klientet',         icon: 'clients', color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
  { label: 'Kontratë e re',  path: '/kontratat',        icon: 'invoice', color: 'bg-slate-50  text-slate-700  hover:bg-slate-100'  },
  { label: 'Faturë e re',    path: '/faturat',          icon: 'invoice', color: 'bg-slate-50  text-slate-700  hover:bg-slate-100'  },
  { label: 'Numër telefonit',path: '/numrat-telefonit', icon: 'phone',   color: 'bg-slate-50  text-slate-700  hover:bg-slate-100'  },
];

// ─── Type pie (simple bars) ───────────────────────────────────────────────────
function TypeBars({ data }) {
  if (!data?.length) return null;
  const total = data.reduce((s, d) => s + d.total, 0) || 1;
  const COLORS = { individual: '#7C3AED', biznes: '#5B21B6', vip: '#F59E0B' };
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.lloji}>
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
            <span className="capitalize">{d.lloji}</span>
            <span>{d.total} <span className="text-slate-400 font-normal">({Math.round(d.total / total * 100)}%)</span></span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.total / total) * 100}%`, background: COLORS[d.lloji] ?? '#7C3AED' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn:  () => api.get('/dashboard/stats').then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Spinner className="w-10 h-10" /></div>;
  }

  const { kpis, revenue, new_clients, by_type, activity } = data ?? {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#111827]">Workspace</h1>
        <p className="text-sm text-slate-500 mt-0.5">Pasqyra analitike e sistemit</p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Klientë gjithsej"
          value={kpis?.total_klientet}
          sub={`${kpis?.klientet_aktiv ?? 0} aktivë`}
          iconKey="clients"
          accent
        />
        <KpiCard
          label="Faturat e muajit"
          value={kpis?.faturat_muajit}
          sub="muaji aktual"
          iconKey="invoice"
        />
        <KpiCard
          label="Borxhi total"
          value={kpis?.borxhi_total != null ? `${Number(kpis.borxhi_total).toFixed(0)}€` : '—'}
          sub="të papaguara"
          iconKey="unpaid"
          warning={kpis?.borxhi_total > 0}
        />
        <KpiCard
          label="Numra aktivë"
          value={kpis?.numrat_aktiv}
          sub="linja aktive"
          iconKey="phone"
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Revenue chart */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <h2 className="text-sm font-black text-[#111827] mb-1">Faturat 6 muajt e fundit</h2>
          <p className="text-[11px] text-slate-400 font-medium mb-5">Total · Paguar · Borxh (€)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenue} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip currency />} />
              <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
              <Bar dataKey="total"  name="Total"  fill="#7C3AED" radius={[4,4,0,0]} />
              <Bar dataKey="paguar" name="Paguar" fill="#A78BFA" radius={[4,4,0,0]} />
              <Bar dataKey="borxh"  name="Borxh"  fill="#FCA5A5" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* New clients chart */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <h2 className="text-sm font-black text-[#111827] mb-1">Klientë të rinj</h2>
          <p className="text-[11px] text-slate-400 font-medium mb-5">Regjistruar 6 muajt e fundit</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={new_clients}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone" dataKey="total" name="Klientë të rinj"
                stroke="#7C3AED" strokeWidth={2.5} dot={{ fill: '#7C3AED', r: 4 }}
                activeDot={{ r: 6, fill: '#5B21B6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom row: Type breakdown + Activity + Quick actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Client types */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <h2 className="text-sm font-black text-[#111827] mb-4">Klientët sipas llojit</h2>
          <TypeBars data={by_type} />
        </div>

        {/* Recent activity */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 lg:col-span-1">
          <h2 className="text-sm font-black text-[#111827] mb-1">Aktiviteti i fundit</h2>
          <p className="text-[11px] text-slate-400 font-medium mb-3">Faturat dhe klientët e rinj</p>
          <ActivityList items={activity} />
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <h2 className="text-sm font-black text-[#111827] mb-4">Veprime të shpejta</h2>
          <div className="space-y-2">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${a.color}`}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-current/10">
                  {STAT_ICONS[a.icon]}
                </div>
                {a.label}
                <svg className="w-4 h-4 ml-auto opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
