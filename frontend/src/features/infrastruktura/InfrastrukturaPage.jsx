import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { infrastrukturaApi } from '../../api/infrastrukturaApi.js';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Badge from '../../components/ui/Badge.jsx';

// ─── Constants ────────────────────────────────────────────────────────────────
const LLOJET = ['router', 'server', 'olt', 'antena', 'switch', 'kabllo', 'firewall', 'tjeter'];
const LLOJET_LABELS = {
  router:   'Router',
  server:   'Server',
  olt:      'OLT',
  antena:   'Antenë',
  switch:   'Switch',
  kabllo:   'Kabllo',
  firewall: 'Firewall',
  tjeter:   'Tjetër',
};

const STATUSET = ['aktive', 'joaktive', 'ne_mirembajtje', 'defekt'];
const STATUSET_LABELS = {
  aktive:          'Aktive',
  joaktive:        'Joaktive',
  ne_mirembajtje:  'Në mirëmbajtje',
  defekt:          'Defekt',
};

const EMPTY_FORM = {
  lloji:                    'router',
  lokacioni:                '',
  kapaciteti:               '',
  statusi:                  'aktive',
  data_instalimit:          '',
  data_mirembajtjes_fundit: '',
  pershkrimi:               '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Lloji Icon ───────────────────────────────────────────────────────────────
const LLOJI_ICONS = {
  router: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  server: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  ),
  olt: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
    </svg>
  ),
  antena: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01M6.343 9.657a8 8 0 0111.314 0M3.515 6.828a12 12 0 0116.97 0M12 4v.01" />
    </svg>
  ),
  default: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

function LlojiIcon({ lloji }) {
  const icon = LLOJI_ICONS[lloji] ?? LLOJI_ICONS.default;
  return (
    <div className="w-9 h-9 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────
function InfrastrukturaForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        lloji:                    initialData.lloji                    ?? 'router',
        lokacioni:                initialData.lokacioni                ?? '',
        kapaciteti:               initialData.kapaciteti               ?? '',
        statusi:                  initialData.statusi                  ?? 'aktive',
        data_instalimit:          initialData.data_instalimit          ? initialData.data_instalimit.substring(0, 10) : '',
        data_mirembajtjes_fundit: initialData.data_mirembajtjes_fundit ? initialData.data_mirembajtjes_fundit.substring(0, 10) : '',
        pershkrimi:               initialData.pershkrimi               ?? '',
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

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.kapaciteti)               payload.kapaciteti = null;
      if (!payload.data_instalimit)          payload.data_instalimit = null;
      if (!payload.data_mirembajtjes_fundit) payload.data_mirembajtjes_fundit = null;
      if (!payload.pershkrimi)              payload.pershkrimi = null;
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Lloji + Statusi */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Lloji *</label>
          <select value={form.lloji} onChange={set('lloji')} className={fc('lloji')}>
            {LLOJET.map((l) => <option key={l} value={l}>{LLOJET_LABELS[l]}</option>)}
          </select>
          <FE field="lloji" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Statusi *</label>
          <select value={form.statusi} onChange={set('statusi')} className={fc('statusi')}>
            {STATUSET.map((s) => <option key={s} value={s}>{STATUSET_LABELS[s]}</option>)}
          </select>
          <FE field="statusi" />
        </div>
      </div>

      {/* Lokacioni */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Lokacioni *</label>
        <input
          type="text"
          required
          value={form.lokacioni}
          onChange={set('lokacioni')}
          placeholder="p.sh. Qendra e Tiranës, Rack 3"
          className={fc('lokacioni')}
        />
        <FE field="lokacioni" />
      </div>

      {/* Kapaciteti */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Kapaciteti</label>
        <input
          type="text"
          value={form.kapaciteti}
          onChange={set('kapaciteti')}
          placeholder="p.sh. 1 Gbps, 128 porta, 10 TB"
          className={fc('kapaciteti')}
        />
        <FE field="kapaciteti" />
      </div>

      {/* Datat */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Data e Instalimit</label>
          <input type="date" value={form.data_instalimit} onChange={set('data_instalimit')} className={fc('data_instalimit')} />
          <FE field="data_instalimit" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mirëmbajtja e Fundit</label>
          <input type="date" value={form.data_mirembajtjes_fundit} onChange={set('data_mirembajtjes_fundit')} className={fc('data_mirembajtjes_fundit')} />
          <FE field="data_mirembajtjes_fundit" />
        </div>
      </div>

      {/* Pershkrimi */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Përshkrimi</label>
        <textarea
          value={form.pershkrimi}
          onChange={set('pershkrimi')}
          rows={2}
          placeholder="Shënime shtesë..."
          className={`${fc('pershkrimi')} resize-none`}
        />
        <FE field="pershkrimi" />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
          Anulo
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-slate-700 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {initialData ? 'Ruaj ndryshimet' : 'Shto pajisjen'}
        </button>
      </div>
    </form>
  );
}

// ─── Status dot for maintenance urgency ───────────────────────────────────────
function MaintDays({ date }) {
  if (!date) return <span className="text-slate-400 text-xs">—</span>;
  const days = Math.floor((Date.now() - new Date(date)) / 86400000);
  const color = days > 365 ? 'text-red-600' : days > 180 ? 'text-amber-600' : 'text-slate-500';
  return <span className={`text-xs font-semibold ${color}`}>{fmt(date)}<span className="text-[10px] ml-1 opacity-60">({days}d)</span></span>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InfrastrukturaPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ search: '', lloji: '', statusi: '', page: 1, per_page: 15 });
  const [formOpen, setFormOpen]       = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['infrastruktura', filters],
    queryFn:  () => infrastrukturaApi.getAll(filters).then((r) => r.data),
    keepPreviousData: true,
  });

  const items      = data?.data       ?? [];
  const pagination = data?.pagination ?? null;

  const createMut = useMutation({
    mutationFn: (payload) => infrastrukturaApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['infrastruktura'] });
      toast.success('Pajisja u shtua me sukses.');
      setFormOpen(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => infrastrukturaApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['infrastruktura'] });
      toast.success('Pajisja u përditësua me sukses.');
      setFormOpen(false);
      setEditTarget(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => infrastrukturaApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['infrastruktura'] });
      toast.success('Pajisja u fshi me sukses.');
      setDeleteTarget(null);
    },
  });

  const setFilter = (key, val) => setFilters((p) => ({ ...p, [key]: val, ...(key !== 'page' && { page: 1 }) }));

  const openCreate = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit   = (item) => { setEditTarget(item); setFormOpen(true); };
  const closeForm  = () => { setFormOpen(false); setEditTarget(null); };

  const handleSubmit = async (payload) => {
    if (editTarget) {
      await updateMut.mutateAsync({ id: editTarget.infrastrukture_id, payload });
    } else {
      await createMut.mutateAsync(payload);
    }
  };

  const isMutating = createMut.isPending || updateMut.isPending;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Infrastruktura</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination?.total != null ? `${pagination.total} pajisje gjithsej` : 'Menaxhimi i pajisjeve të rrjetit'}
          </p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 bg-[#111827] hover:bg-slate-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Shto pajisje
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Kërko lokacion, lloj..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
        <select value={filters.lloji} onChange={(e) => setFilter('lloji', e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
          <option value="">Të gjitha llojet</option>
          {LLOJET.map((l) => <option key={l} value={l}>{LLOJET_LABELS[l]}</option>)}
        </select>
        <select value={filters.statusi} onChange={(e) => setFilter('statusi', e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
          <option value="">Të gjitha statuset</option>
          {STATUSET.map((s) => <option key={s} value={s}>{STATUSET_LABELS[s]}</option>)}
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-semibold">Nuk u gjet asnjë pajisje.</p>
          <p className="text-xs mt-1">Ndryshoni filtrat ose shtoni pajisje të re.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pajisja</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lokacioni</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kapaciteti</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Statusi</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Instalimi</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mirëmbajtja</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item.infrastrukture_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <LlojiIcon lloji={item.lloji} />
                        <div>
                          <p className="font-bold text-slate-900">{LLOJET_LABELS[item.lloji] ?? item.lloji}</p>
                          {item.pershkrimi && (
                            <p className="text-[11px] text-slate-400 mt-0.5 max-w-[160px] truncate">{item.pershkrimi}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-700">{item.lokacioni}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-600">{item.kapaciteti || '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge value={item.statusi} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-500">{fmt(item.data_instalimit)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <MaintDays date={item.data_mirembajtjes_fundit} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          title="Ndrysho">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setDeleteTarget(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Fshi">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
      <Modal isOpen={formOpen} onClose={closeForm} title={editTarget ? 'Ndrysho pajisjen' : 'Shto pajisje të re'} size="lg">
        <InfrastrukturaForm
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
        onConfirm={() => deleteMut.mutate(deleteTarget?.infrastrukture_id)}
        title="Fshi pajisjen?"
        message={`A jeni të sigurt që doni të fshini "${LLOJET_LABELS[deleteTarget?.lloji] ?? ''}" në "${deleteTarget?.lokacioni ?? ''}"? Ky veprim nuk mund të zhbëhet.`}
        confirmLabel="Po, fshi"
        loading={deleteMut.isPending}
      />
    </div>
  );
}
