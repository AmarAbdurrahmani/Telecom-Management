import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../../api/axios.js';
import { useAuthStore } from '../../store/authStore.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(d) {
  return d
    ? new Date(d).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
}

const STATUS_STYLES = {
  e_paguar:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  e_papaguar: 'bg-amber-50  text-amber-700  ring-1 ring-amber-200',
  e_vonuar:   'bg-rose-50   text-rose-700   ring-1 ring-rose-200',
};
const STATUS_LABELS = {
  e_paguar:   'E paguar',
  e_papaguar: 'E papaguar',
  e_vonuar:   'E vonuar',
};

function StatusBadge({ statusi }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${STATUS_STYLES[statusi] ?? 'bg-slate-100 text-slate-500'}`}>
      {STATUS_LABELS[statusi] ?? statusi}
    </span>
  );
}

async function downloadInvoice(fature, kontrate, klient) {
  const filename = `fatura-${String(fature.periudha ?? fature.fature_id).replace(/[/\s]/g, '-')}.pdf`;

  // Build the invoice HTML (rendered off-screen)
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:595px;background:#f5f3ff;padding:40px;font-family:Segoe UI,Arial,sans-serif;';
  wrapper.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(124,58,237,.1)">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #f3f0ff">
        <div style="width:44px;height:44px;background:linear-gradient(135deg,#7c3aed,#a78bfa);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:900;flex-shrink:0">T</div>
        <div>
          <div style="font-size:18px;font-weight:900;color:#1e293b">TelecomMS</div>
          <div style="font-size:11px;font-weight:500;color:#94a3b8;margin-top:2px">Faturë Zyrtare</div>
        </div>
      </div>

      <div style="font-size:22px;font-weight:900;color:#7c3aed;margin-bottom:4px">Fatura — ${fature.periudha}</div>

      <div style="font-size:13px;color:#64748b;margin-bottom:24px;line-height:1.9">
        <strong style="color:#1e293b">${klient.emri} ${klient.mbiemri}</strong><br>
        Kontrata: ${kontrate?.numri_kontrates ?? '—'}<br>
        Data lëshimit: ${fmt(fature.data_leshimit)}<br>
        ${fature.data_pageses ? `Data pagesës: ${fmt(fature.data_pageses)}<br>` : ''}
        Statusi:&nbsp;<span style="display:inline-block;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.05em;${
          fature.statusi === 'e_paguar'   ? 'background:#dcfce7;color:#15803d' :
          fature.statusi === 'e_papaguar' ? 'background:#fef3c7;color:#b45309' :
                                            'background:#fee2e2;color:#b91c1c'
        }">${STATUS_LABELS[fature.statusi] ?? fature.statusi}</span>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        ${[
          ['Shuma bazë',      Number(fature.shuma_baze).toFixed(2)],
          ['Shërbime shtesë', Number(fature.shuma_shtese ?? 0).toFixed(2)],
          ['TVSH',            Number(fature.tatimi ?? 0).toFixed(2)],
        ].map(([l, v]) => `
          <tr style="border-bottom:1px solid #f1f5f9">
            <td style="padding:10px 0;font-size:14px;color:#1e293b">${l}</td>
            <td style="padding:10px 0;font-size:14px;font-weight:700;text-align:right;color:#1e293b">${v} €</td>
          </tr>`).join('')}
        <tr>
          <td style="padding:16px 0 10px;font-size:17px;font-weight:900;color:#7c3aed;border-top:2px solid #ede9fe">TOTALI</td>
          <td style="padding:16px 0 10px;font-size:17px;font-weight:900;color:#7c3aed;text-align:right;border-top:2px solid #ede9fe">${Number(fature.totali).toFixed(2)} €</td>
        </tr>
      </table>

      <div style="margin-top:32px;padding-top:20px;border-top:1px solid #f1f5f9;text-align:center;font-size:11px;color:#94a3b8">
        TelecomMS · Gjeneruar automatikisht · ${new Date().toLocaleDateString('sq-AL')}
      </div>
    </div>`;

  document.body.appendChild(wrapper);

  try {
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f5f3ff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
    pdf.save(filename);
  } finally {
    document.body.removeChild(wrapper);
  }
}

// ─── Reusable download button ─────────────────────────────────────────────────
function DownloadBtn({ fature, kontrate, klient, small = false }) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try { await downloadInvoice(fature, kontrate, klient); }
    finally { setLoading(false); }
  }

  const size = small ? 'w-7 h-7' : 'w-8 h-8';
  const icon = small ? 'w-3.5 h-3.5' : 'w-3.5 h-3.5';
  const bg   = small
    ? 'bg-violet-100 hover:bg-violet-200 text-[#7c3aed]'
    : 'bg-violet-50 hover:bg-violet-100 text-violet-500';

  return (
    <button
      onClick={handle}
      disabled={loading}
      title="Shkarko PDF"
      className={`${size} rounded-lg ${bg} disabled:opacity-60 flex items-center justify-center transition-colors flex-shrink-0`}
    >
      {loading
        ? <div className={`${icon} border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin`} />
        : <svg className={icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
      }
    </button>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, ring }) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-violet-100/70 rounded-2xl p-4 sm:p-5 flex items-center gap-3 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${ring}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-slate-800 leading-tight truncate">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Invoice card ─────────────────────────────────────────────────────────────
function FatureCard({ fature, kontrate, klient, onPay, paying }) {
  const isUnpaid  = fature.statusi !== 'e_paguar';
  const isOverdue = fature.statusi === 'e_vonuar';

  return (
    <div className={`bg-white/80 backdrop-blur-md border rounded-2xl p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md ${
      isOverdue ? 'border-rose-200' : isUnpaid ? 'border-amber-200' : 'border-violet-100/70'
    }`}>
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isOverdue ? 'bg-rose-100' : isUnpaid ? 'bg-amber-100' : 'bg-violet-100'
        }`}>
          <svg className={`w-5 h-5 ${isOverdue ? 'text-rose-500' : isUnpaid ? 'text-amber-500' : 'text-violet-500'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-[15px] font-black text-slate-800">{fature.periudha}</p>
            <StatusBadge statusi={fature.statusi} />
          </div>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            {kontrate?.numri_kontrates} · Lëshuar {fmt(fature.data_leshimit)}
            {fature.data_pageses && ` · Paguar ${fmt(fature.data_pageses)}`}
          </p>
        </div>

        {/* Amount + actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <p className={`text-xl font-black ${isOverdue ? 'text-rose-600' : isUnpaid ? 'text-amber-600' : 'text-slate-800'}`}>
            {Number(fature.totali).toFixed(2)}€
          </p>
          <div className="flex items-center gap-1.5">
            <DownloadBtn fature={fature} kontrate={kontrate} klient={klient} />
            {isUnpaid && (
              <button
                onClick={() => onPay(fature)}
                disabled={paying}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-60 text-white text-[11px] font-black rounded-lg transition-colors shadow-sm shadow-violet-200"
              >
                {paying
                  ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                }
                Paguaj
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
        {[
          { label: 'Baza',   val: fature.shuma_baze },
          { label: 'Shtesë', val: fature.shuma_shtese ?? 0 },
          { label: 'TVSH',   val: fature.tatimi ?? 0 },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</p>
            <p className="text-sm font-black text-slate-600">{Number(item.val).toFixed(2)}€</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KlientPortalPage() {
  const [tab, setTab] = useState('borxhi');
  const [searchParams, setSearchParams] = useSearchParams();
  const [payingId, setPayingId] = useState(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['portal', user?.id],
    queryFn: () => api.get('/auth/portal').then((r) => r.data),
    staleTime: 0,
  });

  // Handle Stripe redirect back
  useEffect(() => {
    if (searchParams.get('stripe_success') === '1') {
      toast.success('Pagesa u krye me sukses!');
      queryClient.invalidateQueries({ queryKey: ['portal', user?.id] });
      setSearchParams({}, { replace: true });
      setTab('te_gjitha');
    } else if (searchParams.get('stripe_cancel') === '1') {
      toast.error('Pagesa u anullua.');
      setSearchParams({}, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const payMutation = useMutation({
    mutationFn: ({ fature_id, shuma }) =>
      api.post('/portal/stripe/checkout', { fature_id, shuma }).then((r) => r.data),
    onSuccess: ({ checkout_url }) => {
      if (checkout_url) window.location.href = checkout_url;
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Gabim gjatë inicializimit të pagesës.');
      setPayingId(null);
    },
  });

  function handlePay(fature) {
    setPayingId(fature.fature_id);
    payMutation.mutate({ fature_id: fature.fature_id, shuma: fature.totali });
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-12 h-12 border-4 border-violet-100 border-t-[#7c3aed] rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Duke ngarkuar...</p>
      </div>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <div className="py-40 text-center">
        <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-600">Ndodhi një gabim. Provo sërish.</p>
      </div>
    );
  }

  const { klient, kontratat, summary } = data;

  const tgjitha = kontratat
    .flatMap((k) => (k.faturat ?? []).map((f) => ({ ...f, _kontrate: k })))
    .sort((a, b) => new Date(b.data_leshimit) - new Date(a.data_leshimit));

  const borxhi = tgjitha.filter((f) => f.statusi !== 'e_paguar');
  const paguar = tgjitha.filter((f) => f.statusi === 'e_paguar');

  const initials = `${klient.emri.charAt(0)}${klient.mbiemri.charAt(0)}`.toUpperCase();

  const TABS = [
    { key: 'borxhi',    label: 'Borxhi',    count: borxhi.length    },
    { key: 'te_gjitha', label: 'Të gjitha', count: tgjitha.length   },
    { key: 'kontratat', label: 'Kontratat', count: kontratat.length  },
  ];

  return (
    <div className="space-y-5 pb-10">

      {/* ── Client header ── */}
      <div className="bg-white/80 backdrop-blur-md border border-violet-100/70 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center text-white text-xl font-black flex-shrink-0 shadow-lg shadow-violet-200/60">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
              {klient.emri} {klient.mbiemri}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
              {[
                { d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', v: klient.email },
                { d: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', v: klient.telefoni },
                klient.adresa && { d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', v: klient.adresa },
              ].filter(Boolean).map((item, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <svg className="w-3.5 h-3.5 text-[#7c3aed] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.d} />
                  </svg>
                  <span className="truncate max-w-[200px]">{item.v}</span>
                </span>
              ))}
            </div>
          </div>
          {/* Debt indicator */}
          <div className={`hidden sm:flex flex-col items-end ${summary.total_borxh > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            <p className="text-3xl font-black leading-none">
              {summary.total_borxh > 0 ? `${summary.total_borxh.toFixed(2)}€` : '✓'}
            </p>
            <p className="text-xs font-bold mt-1 opacity-70">
              {summary.total_borxh > 0 ? 'borxh total' : 'pa borxh'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Borxhi total"
          value={`${summary.total_borxh.toFixed(2)}€`}
          sub={borxhi.length ? `${borxhi.length} faturë` : 'pa borxh'}
          ring={summary.total_borxh > 0 ? 'bg-rose-100' : 'bg-emerald-100'}
          icon={
            <svg className={`w-5 h-5 ${summary.total_borxh > 0 ? 'text-rose-500' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total paguar"
          value={`${summary.total_paguar.toFixed(2)}€`}
          sub={`${paguar.length} faturë`}
          ring="bg-emerald-100"
          icon={
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Kontrata"
          value={summary.total_kontrata}
          sub={`${summary.kontrata_aktive} aktive`}
          ring="bg-violet-100"
          icon={
            <svg className="w-5 h-5 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Gjithsej fatura"
          value={tgjitha.length}
          sub={`${summary.total_fatura.toFixed(2)}€ total`}
          ring="bg-blue-100"
          icon={
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          }
        />
      </div>

      {/* ── Quick Pay banner ── */}
      {summary.total_borxh > 0 && (
        <div className="bg-gradient-to-r from-[#7c3aed] to-[#9333ea] rounded-2xl p-5 sm:p-6 shadow-lg shadow-violet-300/30">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-lg leading-tight">Borxh i papaguar</p>
                <p className="text-white/70 text-sm font-medium mt-0.5">
                  {borxhi.length} {borxhi.length === 1 ? 'faturë' : 'fatura'} ·{' '}
                  <span className="font-black text-white">{summary.total_borxh.toFixed(2)}€</span>
                </p>
              </div>
            </div>
            {borxhi.length === 1 ? (
              <button
                onClick={() => handlePay(borxhi[0])}
                disabled={payingId !== null}
                className="flex items-center gap-2 bg-white text-[#7c3aed] px-5 py-2.5 rounded-xl text-sm font-black hover:bg-violet-50 transition-colors disabled:opacity-60 shadow-md"
              >
                {payingId ? (
                  <div className="w-4 h-4 border-2 border-violet-200 border-t-[#7c3aed] rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                )}
                Paguaj Online
              </button>
            ) : (
              <button
                onClick={() => setTab('borxhi')}
                className="text-white font-black text-sm underline underline-offset-2 hover:text-white/80 transition-colors"
              >
                Shiko të gjitha →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="bg-white/80 backdrop-blur-md border border-violet-100/70 rounded-2xl p-1.5 flex gap-1 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold rounded-xl transition-all ${
              tab === t.key
                ? 'bg-[#7c3aed] text-white shadow-md shadow-violet-300/30'
                : 'text-slate-500 hover:text-[#7c3aed] hover:bg-violet-50'
            }`}
          >
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.split(' ')[0]}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              tab === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Borxhi tab ── */}
      {tab === 'borxhi' && (
        borxhi.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md border border-violet-100/70 rounded-2xl py-16 text-center shadow-sm">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-base font-black text-slate-700">Nuk keni borxh!</p>
            <p className="text-sm text-slate-400 font-medium mt-1">Të gjitha faturat janë paguar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {borxhi.map((f) => (
              <FatureCard
                key={f.fature_id}
                fature={f}
                kontrate={f._kontrate}
                klient={klient}
                onPay={handlePay}
                paying={payingId === f.fature_id}
              />
            ))}
          </div>
        )
      )}

      {/* ── Të gjitha tab ── */}
      {tab === 'te_gjitha' && (
        tgjitha.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md border border-violet-100/70 rounded-2xl py-16 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-400">Nuk ka fatura ende.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tgjitha.map((f) => (
              <FatureCard
                key={f.fature_id}
                fature={f}
                kontrate={f._kontrate}
                klient={klient}
                onPay={handlePay}
                paying={payingId === f.fature_id}
              />
            ))}
          </div>
        )
      )}

      {/* ── Kontratat tab ── */}
      {tab === 'kontratat' && (
        <div className="space-y-4">
          {kontratat.map((k) => (
            <div key={k.kontrate_id} className="bg-white/80 backdrop-blur-md border border-violet-100/70 rounded-2xl p-5 shadow-sm">

              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-wider">{k.numri_kontrates}</p>
                    <p className="text-base font-black text-slate-800 leading-tight">{k.paket?.emri_paketes ?? '—'}</p>
                    {k.paket && (
                      <p className="text-xs text-slate-400 font-medium">
                        {Number(k.paket.cmimi_mujor).toFixed(2)}€/muaj · {k.paket.lloji_sherbimit}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0 ${
                  k.statusi === 'aktive'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                }`}>
                  {k.statusi}
                </span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 bg-violet-50/60 rounded-xl px-4 py-3 mb-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Fillimi</p>
                  <p className="text-sm font-black text-slate-700">{fmt(k.data_fillimit)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mbarimi</p>
                  <p className="text-sm font-black text-slate-700">{fmt(k.data_mbarimit)}</p>
                </div>
              </div>

              {/* Phone numbers */}
              {k.numrat_telefonit?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {k.numrat_telefonit.map((n) => (
                    <span key={n.numri_id} className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200/70 text-[#7c3aed] text-[11px] font-bold px-3 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {n.numri_telefonit}
                    </span>
                  ))}
                </div>
              )}

              {/* Invoice mini-list */}
              {k.faturat?.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Faturat</p>
                  <div className="space-y-1.5">
                    {k.faturat.map((f) => (
                      <div key={f.fature_id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 hover:bg-violet-50/50 transition-colors">
                        <div>
                          <p className="text-[13px] font-bold text-slate-700">{f.periudha}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{fmt(f.data_leshimit)}</p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <StatusBadge statusi={f.statusi} />
                          <p className="text-sm font-black text-slate-700 w-14 text-right">{Number(f.totali).toFixed(2)}€</p>
                          <DownloadBtn fature={f} kontrate={k} klient={klient} small />
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

      <p className="text-center text-[11px] text-slate-300 font-medium">TelecomMS · v1.0.0</p>
    </div>
  );
}
