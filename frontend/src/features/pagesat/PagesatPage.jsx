import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { pagesatApi } from '../../api/pagesatApi.js';
import { stripeApi } from '../../api/stripeApi.js';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Badge from '../../components/ui/Badge.jsx';

// ─── Constants ────────────────────────────────────────────────────────────────
const METODAT = ['cash', 'online', 'transfer'];
const METODAT_LABELS = {
  cash:     'Kesh',
  online:   'Online',
  transfer: 'Transfer',
};

// SVG icon components per method
const METODA_ICONS = {
  cash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  ),
  online: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4M14 15h4" strokeWidth={2} />
    </svg>
  ),
  transfer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M7 16V4m0 0L3 8m4-4l4 4" />
      <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
};

const EMPTY_FORM = {
  fature_id:    '',
  shuma:        '',
  data_pageses: new Date().toISOString().substring(0, 10),
  metoda:       'cash',
  referenca:    '',
  shenime:      '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Pagese Form ──────────────────────────────────────────────────────────────
function PageseForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [stripeLoading, setStripeLoading] = useState(false);

  const { data: faturat = [] } = useQuery({
    queryKey: ['pagesat-faturat'],
    queryFn:  () => pagesatApi.faturatList().then((r) => r.data),
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        fature_id:    initialData.fature_id    ?? '',
        shuma:        initialData.shuma        ?? '',
        data_pageses: initialData.data_pageses ? String(initialData.data_pageses).substring(0, 10) : new Date().toISOString().substring(0, 10),
        metoda:       initialData.metoda       ?? 'cash',
        referenca:    initialData.referenca    ?? '',
        shenime:      initialData.shenime      ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [initialData]);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const isOnlineNew = form.metoda === 'online' && !initialData;

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      fature_id: Number(form.fature_id),
      shuma:     parseFloat(form.shuma),
      referenca: form.referenca || null,
      shenime:   form.shenime   || null,
    };

    // Online payment — redirect to Stripe Checkout instead of saving locally
    if (isOnlineNew) {
      if (!payload.fature_id || !payload.shuma) return;
      setStripeLoading(true);
      try {
        const { data } = await stripeApi.createCheckoutSession({
          fature_id: payload.fature_id,
          shuma:     payload.shuma,
        });
        const url = data?.url;
        if (!url) throw new Error('URL e sesionit mungon në përgjigjen e serverit.');
        // Full page redirect — Stripe handles payment, webhook records the pagese on return
        window.location.href = url;
      } catch (err) {
        setStripeLoading(false);
        const msg = err.response?.data?.message || err.message || 'Gabim i panjohur.';
        toast.error(`Stripe: ${msg}`);
      }
      return;
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) setErrors(serverErrors);
    }
  }

  const fc = (field) =>
    `w-full border rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
      errors[field] ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-violet-500'
    }`;
  const FE = ({ field }) => errors[field]
    ? <p className="mt-1 text-xs text-red-600 font-medium">{errors[field][0]}</p>
    : null;

  // Selected fature info for amount hint
  const selectedFature = faturat.find((f) => f.fature_id === Number(form.fature_id));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Fatura */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Fatura <span className="text-red-500">*</span>
        </label>
        <select required value={form.fature_id} onChange={set('fature_id')} className={fc('fature_id')}>
          <option value="">— Zgjidhni faturën —</option>
          {faturat.map((f) => (
            <option key={f.fature_id} value={f.fature_id}>
              {f.klient_emri} · {f.periudha} · {Number(f.totali).toFixed(2)}€
            </option>
          ))}
        </select>
        {selectedFature && (
          <p className="mt-1 text-xs text-violet-600 font-semibold">
            Totali i faturës: {Number(selectedFature.totali).toFixed(2)}€
          </p>
        )}
        <FE field="fature_id" />
      </div>

      {/* Shuma + Data */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Shuma (€) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            value={form.shuma}
            onChange={set('shuma')}
            placeholder="0.00"
            className={fc('shuma')}
          />
          <FE field="shuma" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Data e Pagesës <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={form.data_pageses}
            onChange={set('data_pageses')}
            className={fc('data_pageses')}
          />
          <FE field="data_pageses" />
        </div>
      </div>

      {/* Metoda */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Metoda e Pagesës <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {METODAT.map((m) => {
            const active = form.metoda === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setForm((p) => ({ ...p, metoda: m }))}
                className={`relative flex flex-col items-center gap-2.5 py-5 px-3 rounded-2xl border-2 font-bold transition-all duration-150 ${
                  active
                    ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm shadow-violet-100'
                    : 'border-slate-200 bg-white text-slate-400 hover:border-violet-300 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {active && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-violet-500" />
                )}
                <span className={active ? 'text-violet-600' : 'text-slate-400'}>
                  {METODA_ICONS[m]}
                </span>
                <span className="text-[11px] tracking-wide">{METODAT_LABELS[m]}</span>
              </button>
            );
          })}
        </div>
        <FE field="metoda" />
      </div>

      {/* Referenca + Shenime — hidden for new online payments (Stripe fills them via webhook) */}
      {!isOnlineNew && (
        <>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Referenca</label>
            <input
              type="text"
              value={form.referenca}
              onChange={set('referenca')}
              placeholder="Nr. transaksioni, ref. bankare..."
              className={fc('referenca')}
            />
            <FE field="referenca" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Shënime</label>
            <textarea
              value={form.shenime}
              onChange={set('shenime')}
              rows={2}
              placeholder="Shënim opsional..."
              className={`${fc('shenime')} resize-none`}
            />
            <FE field="shenime" />
          </div>
        </>
      )}

      {/* Stripe info panel — shown only for new online payments */}
      {isOnlineNew && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3.5 flex gap-3 items-start">
          <svg className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <div>
            <p className="text-xs font-bold text-violet-800">Pagesa nëpërmjet Stripe</p>
            <p className="text-xs text-violet-600 mt-0.5">
              Do të ridrejtoheni te faqja e sigurt e Stripe. Pasi pagesa të konfirmohet,
              fatura do të shënohet automatikisht si <strong>E paguar</strong>.
            </p>
            <p className="text-[10px] text-violet-400 mt-1.5 font-mono">
              Referenca dhe data vendosen automatikisht nga Stripe.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={loading || stripeLoading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
          Anulo
        </button>
        <button
          type="submit"
          disabled={loading || stripeLoading}
          className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${
            isOnlineNew
              ? 'bg-violet-600 hover:bg-violet-700'
              : 'bg-[#111827] hover:bg-slate-700'
          }`}
        >
          {(loading || stripeLoading) && (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          )}
          {initialData
            ? 'Ruaj ndryshimet'
            : isOnlineNew
              ? 'Vazhdo te Stripe →'
              : 'Regjistro pagesën'
          }
        </button>
      </div>
    </form>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────
function SumCard({ label, value, color }) {
  const colors = {
    slate:  'bg-slate-50  text-slate-800',
    green:  'bg-green-50  text-green-700',
    violet: 'bg-violet-50 text-violet-700',
  };
  return (
    <div className={`rounded-2xl px-5 py-4 ${colors[color]}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <p className="text-xl font-black leading-none">{value}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PagesatPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ search: '', metoda: '', page: 1, per_page: 15 });
  const [formOpen, setFormOpen]         = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Handle Stripe redirect-back (success or cancel)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('stripe_success') === '1') {
      const fatureId = params.get('fature_id');
      const shuma    = params.get('shuma');
      const detail   = fatureId && shuma
        ? ` Fatura #${fatureId} — ${Number(shuma).toFixed(2)}€`
        : '';
      toast.success(`Pagesa u krye me sukses nëpërmjet Stripe!${detail}`);
      qc.invalidateQueries({ queryKey: ['pagesat'] });
      qc.invalidateQueries({ queryKey: ['faturat'] });
      qc.invalidateQueries({ queryKey: ['pagesat-faturat'] });
      window.history.replaceState({}, '', '/pagesat');
    } else if (params.get('stripe_cancel') === '1') {
      toast.error('Pagesa u anulua. Mund të provoni përsëri.');
      window.history.replaceState({}, '', '/pagesat');
    }
  }, [qc]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['pagesat', filters],
    queryFn:  () => pagesatApi.getAll(filters).then((r) => r.data),
    keepPreviousData: true,
  });

  const items      = data?.data       ?? [];
  const pagination = data?.pagination ?? null;

  const createMut = useMutation({
    mutationFn: (payload) => pagesatApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pagesat'] });
      qc.invalidateQueries({ queryKey: ['faturat'] });
      qc.invalidateQueries({ queryKey: ['pagesat-faturat'] });
      toast.success('Pagesa u regjistrua me sukses.');
      setFormOpen(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => pagesatApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pagesat'] });
      qc.invalidateQueries({ queryKey: ['faturat'] });
      qc.invalidateQueries({ queryKey: ['pagesat-faturat'] });
      toast.success('Pagesa u përditësua me sukses.');
      setFormOpen(false);
      setEditTarget(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => pagesatApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pagesat'] });
      qc.invalidateQueries({ queryKey: ['faturat'] });
      qc.invalidateQueries({ queryKey: ['pagesat-faturat'] });
      toast.success('Pagesa u fshi me sukses.');
      setDeleteTarget(null);
    },
  });

  const setFilter  = (k, v) => setFilters((p) => ({ ...p, [k]: v, ...(k !== 'page' && { page: 1 }) }));
  const openCreate = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit   = (p) => { setEditTarget(p);   setFormOpen(true); };
  const closeForm  = ()  => { setFormOpen(false); setEditTarget(null); };

  const handleSubmit = async (payload) => {
    if (editTarget) {
      await updateMut.mutateAsync({ id: editTarget.pagese_id, payload });
    } else {
      await createMut.mutateAsync(payload);
    }
  };

  const isMutating = createMut.isPending || updateMut.isPending;

  // Stats from current page
  const totalShuma = items.reduce((s, p) => s + Number(p.shuma), 0);
  const byMetoda   = METODAT.reduce((acc, m) => {
    acc[m] = items.filter((p) => p.metoda === m).reduce((s, p) => s + Number(p.shuma), 0);
    return acc;
  }, { cash: 0, online: 0, transfer: 0 });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Pagesat</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination?.total != null ? `${pagination.total} pagesa gjithsej` : 'Regjistrimi i pagesave të faturave'}
          </p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 bg-[#111827] hover:bg-slate-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Regjistro pagesë
        </button>
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <SumCard label="Totali i faqes" value={`${totalShuma.toFixed(2)}€`}          color="green"  />
          <SumCard label="Kesh"           value={`${byMetoda.cash.toFixed(2)}€`}        color="slate"  />
          <SumCard label="Online"         value={`${byMetoda.online.toFixed(2)}€`}      color="violet" />
          <SumCard label="Transfer"       value={`${byMetoda.transfer.toFixed(2)}€`}    color="slate"  />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Kërko klient, periudhë, referencë..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
        <select value={filters.metoda} onChange={(e) => setFilter('metoda', e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
          <option value="">Të gjitha metodat</option>
          {METODAT.map((m) => <option key={m} value={m}>{METODAT_LABELS[m]}</option>)}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24"><Spinner className="w-10 h-10" /></div>
      ) : isError ? (
        <div className="flex items-center justify-center py-24 text-slate-500">
          <p className="text-sm font-medium">Ndodhi një gabim gjatë ngarkimit.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm font-semibold">Nuk u gjetën pagesa.</p>
          <p className="text-xs mt-1">Ndryshoni filtrat ose regjistroni pagesë të re.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Klienti / Fatura</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Metoda</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Referenca</th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shuma</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Statusi Faturës</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((p) => {
                  const klient = p.fature?.kontrate?.klient;
                  const klientEmri = klient ? `${klient.emri} ${klient.mbiemri}` : '—';
                  return (
                    <tr key={p.pagese_id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Klienti / Fatura */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{klientEmri}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {p.fature?.periudha ?? '—'} · {p.fature?.kontrate?.numri_kontrates ?? '—'}
                        </p>
                      </td>
                      {/* Metoda */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${
                          p.metoda === 'online'
                            ? 'bg-violet-50 text-violet-700'
                            : p.metoda === 'transfer'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                        }`}>
                          {METODAT_LABELS[p.metoda] ?? p.metoda}
                        </span>
                      </td>
                      {/* Data */}
                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold text-slate-600">{fmt(p.data_pageses)}</span>
                      </td>
                      {/* Referenca */}
                      <td className="px-5 py-4">
                        {p.referenca
                          ? <span className="text-xs font-mono text-slate-600">{p.referenca}</span>
                          : <span className="text-slate-300">—</span>
                        }
                      </td>
                      {/* Shuma */}
                      <td className="px-5 py-4 text-right">
                        <span className="text-base font-black text-emerald-700">{Number(p.shuma).toFixed(2)}€</span>
                      </td>
                      {/* Statusi Fatures */}
                      <td className="px-5 py-4">
                        <Badge value={p.fature?.statusi} />
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                            title="Ndrysho">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleteTarget(p)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Fshi">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-500">
            Duke shfaqur {pagination.from}–{pagination.to} nga {pagination.total}
          </p>
          <div className="flex gap-2">
            <button disabled={filters.page <= 1} onClick={() => setFilter('page', filters.page - 1)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors">
              Prapa
            </button>
            <span className="px-4 py-2 text-sm font-black text-slate-900">{filters.page} / {pagination.last_page}</span>
            <button disabled={filters.page >= pagination.last_page} onClick={() => setFilter('page', filters.page + 1)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors">
              Para
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={formOpen} onClose={closeForm} title={editTarget ? 'Ndrysho pagesën' : 'Regjistro pagesë të re'} size="md">
        <PageseForm
          initialData={editTarget}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          loading={isMutating}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMut.mutate(deleteTarget?.pagese_id)}
        title="Fshi pagesën?"
        message={`A jeni të sigurt që doni të fshini pagesën prej ${Number(deleteTarget?.shuma ?? 0).toFixed(2)}€? Fatura do të kthehet si e papaguar.`}
        confirmLabel="Po, fshi"
        loading={deleteMut.isPending}
      />
    </div>
  );
}
