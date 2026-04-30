import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { pajisjetApi } from '../../api/pajisjetApi.js';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

// ─── Brand colours ────────────────────────────────────────────────────────────
const BRAND_COLORS = {
  Apple:    { bg: 'bg-[#1c1c1e]',   text: 'text-white', hex: '#1c1c1e',   screen: '#2c2c2e' },
  Samsung:  { bg: 'bg-[#1428a0]',   text: 'text-white', hex: '#1428a0',   screen: '#1a3fbf' },
  Google:   { bg: 'bg-[#4285f4]',   text: 'text-white', hex: '#4285f4',   screen: '#5b9cf6' },
  Xiaomi:   { bg: 'bg-[#ff6900]',   text: 'text-white', hex: '#ff6900',   screen: '#ff8c38' },
  Nothing:  { bg: 'bg-[#1a1a1a]',   text: 'text-white', hex: '#1a1a1a',   screen: '#2e2e2e' },
  Honor:    { bg: 'bg-[#c00]',       text: 'text-white', hex: '#cc0000',   screen: '#e02020' },
  Motorola: { bg: 'bg-[#003087]',   text: 'text-white', hex: '#003087',   screen: '#004ab3' },
  ZTE:      { bg: 'bg-[#006b3f]',   text: 'text-white', hex: '#006b3f',   screen: '#008c52' },
};

// ─── Phone SVG illustration ───────────────────────────────────────────────────
function PhoneIllustration({ hex = '#7c5cdb', screen = '#a78bfa' }) {
  return (
    <svg viewBox="0 0 60 100" className="w-14 h-24 drop-shadow-lg" fill="none">
      {/* Body */}
      <rect x="4" y="2" width="52" height="96" rx="10" fill={hex} />
      {/* Side button */}
      <rect x="54" y="28" width="3" height="14" rx="1.5" fill={hex} opacity="0.6" />
      {/* Volume buttons */}
      <rect x="3" y="24" width="3" height="10" rx="1.5" fill={hex} opacity="0.6" />
      <rect x="3" y="38" width="3" height="10" rx="1.5" fill={hex} opacity="0.6" />
      {/* Screen */}
      <rect x="8" y="10" width="44" height="76" rx="6" fill={screen} />
      {/* Notch/pill */}
      <rect x="20" y="13" width="20" height="5" rx="2.5" fill={hex} opacity="0.7" />
      {/* Status bar lines */}
      <rect x="14" y="24" width="12" height="2" rx="1" fill="white" opacity="0.2" />
      <rect x="34" y="24" width="8" height="2" rx="1" fill="white" opacity="0.2" />
      {/* App grid */}
      {[0,1,2].map((row) =>
        [0,1,2,3].map((col) => (
          <rect key={`${row}-${col}`}
            x={14 + col * 10} y={32 + row * 10} width="7" height="7" rx="2"
            fill="white" opacity="0.15" />
        ))
      )}
      {/* Home bar */}
      <rect x="22" y="80" width="16" height="3" rx="1.5" fill="white" opacity="0.4" />
    </svg>
  );
}

const EMPTY_FORM = {
  emri: '', marka: '', cmimi_cash: '', cmimi_keste: '',
  muajt_kestes: 24, disponueshme: true, pershkrimi: '',
};

function fmt(n) { return Number(n).toFixed(2); }

// ─── Device Card ──────────────────────────────────────────────────────────────
function PajisjeCard({ p, onEdit, onDelete }) {
  const brand      = BRAND_COLORS[p.marka] ?? { bg: 'bg-[#7c5cdb]', text: 'text-white', hex: '#7c5cdb', screen: '#a78bfa' };
  const totalKeste = fmt(p.cmimi_keste * p.muajt_kestes);

  return (
    <div className={`bg-white border border-[#f0edf8] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${!p.disponueshme ? 'opacity-60' : ''}`}>
      {/* Brand header with phone illustration */}
      <div className={`${brand.bg} px-5 pt-4 pb-0 flex items-end justify-between overflow-hidden`} style={{ minHeight: 120 }}>
        <div className="pb-4">
          <span className={`text-[11px] font-black uppercase tracking-widest ${brand.text} opacity-80`}>{p.marka}</span>
          {!p.disponueshme && (
            <span className="ml-2 text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded-full text-white">Joaktive</span>
          )}
        </div>
        <div className="translate-y-2">
          <PhoneIllustration hex={brand.hex} screen={brand.screen} />
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-base font-black text-slate-900 mb-1">{p.emri}</h3>
        {p.pershkrimi && <p className="text-xs text-slate-400 mb-4 leading-relaxed">{p.pershkrimi}</p>}

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#f8f7fc] rounded-xl px-3 py-2.5 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Cash</p>
            <p className="text-lg font-black text-slate-900">{fmt(p.cmimi_cash)}€</p>
          </div>
          <div className="bg-[#ede9f7] rounded-xl px-3 py-2.5 text-center">
            <p className="text-[10px] font-bold text-[#7c5cdb] uppercase tracking-wider mb-0.5">Këste</p>
            <p className="text-lg font-black text-[#7c5cdb]">{fmt(p.cmimi_keste)}€<span className="text-xs font-semibold">/muaj</span></p>
            <p className="text-[10px] text-[#7c5cdb]/60">{p.muajt_kestes} muaj · {totalKeste}€</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={() => onEdit(p)}
            className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            Ndrysho
          </button>
          <button onClick={() => onDelete(p)}
            className="py-2 px-3 rounded-xl border border-red-100 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────
function PajisjeForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        emri:          initialData.emri          ?? '',
        marka:         initialData.marka         ?? '',
        cmimi_cash:    initialData.cmimi_cash    ?? '',
        cmimi_keste:   initialData.cmimi_keste   ?? '',
        muajt_kestes:  initialData.muajt_kestes  ?? 24,
        disponueshme:  initialData.disponueshme  ?? true,
        pershkrimi:    initialData.pershkrimi    ?? '',
      });
    } else { setForm(EMPTY_FORM); }
    setErrors({});
  }, [initialData]);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [field]: val }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await onSubmit({
        ...form,
        cmimi_cash:   parseFloat(form.cmimi_cash),
        cmimi_keste:  parseFloat(form.cmimi_keste),
        muajt_kestes: parseInt(form.muajt_kestes),
        pershkrimi:   form.pershkrimi || null,
      });
    } catch (err) {
      const se = err.response?.data?.errors;
      if (se) setErrors(se);
    }
  }

  const fc = (f) =>
    `w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition ${
      errors[f] ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-violet-500'
    }`;
  const FE = ({ field }) => errors[field]
    ? <p className="mt-1 text-xs text-red-600">{errors[field][0]}</p> : null;

  // Live monthly total preview
  const totalMujor = (parseFloat(form.cmimi_keste) || 0);
  const totalKeste  = totalMujor * (parseInt(form.muajt_kestes) || 24);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Emri i pajisjes *</label>
          <input required value={form.emri} onChange={set('emri')} placeholder="iPhone 15 Pro" className={fc('emri')} />
          <FE field="emri" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Marka *</label>
          <input required value={form.marka} onChange={set('marka')} placeholder="Apple" className={fc('marka')} />
          <FE field="marka" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Muajt këstesh</label>
          <input type="number" min={1} max={60} value={form.muajt_kestes} onChange={set('muajt_kestes')} className={fc('muajt_kestes')} />
          <FE field="muajt_kestes" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Çmimi Cash (€) *</label>
          <input required type="number" min={0} step="0.01" value={form.cmimi_cash} onChange={set('cmimi_cash')} placeholder="999.00" className={fc('cmimi_cash')} />
          <FE field="cmimi_cash" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Kësti Mujor (€) *</label>
          <input required type="number" min={0} step="0.01" value={form.cmimi_keste} onChange={set('cmimi_keste')} placeholder="41.99" className={fc('cmimi_keste')} />
          <FE field="cmimi_keste" />
        </div>
      </div>

      {/* Total preview */}
      {totalMujor > 0 && (
        <div className="bg-violet-50 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-bold text-violet-600">Total me këste ({form.muajt_kestes} muaj)</span>
          <span className="text-base font-black text-violet-700">{totalKeste.toFixed(2)}€</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Përshkrimi</label>
        <textarea rows={2} value={form.pershkrimi} onChange={set('pershkrimi')}
          placeholder="Specifikime, veçori..." className={`${fc('pershkrimi')} resize-none`} />
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setForm((p) => ({ ...p, disponueshme: !p.disponueshme }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.disponueshme ? 'bg-violet-600' : 'bg-slate-200'}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.disponueshme ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span className="text-sm font-semibold text-slate-700">{form.disponueshme ? 'Disponueshme' : 'Joaktive (stoku i mbaruar)'}</span>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors">
          Anulo
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-slate-700 text-white text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {initialData ? 'Ruaj ndryshimet' : 'Shto pajisjen'}
        </button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PajisjetPage() {
  const qc = useQueryClient();
  const [filters, setFilters]       = useState({ search: '', disponueshme: '', page: 1, per_page: 12 });
  const [formOpen, setFormOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['pajisjet', filters],
    queryFn:  () => pajisjetApi.getAll(filters).then((r) => r.data),
    keepPreviousData: true,
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination ?? null;

  const createMut = useMutation({
    mutationFn: (payload) => pajisjetApi.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pajisjet'] }); toast.success('Pajisja u shtua.'); setFormOpen(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => pajisjetApi.update(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pajisjet'] }); toast.success('Pajisja u përditësua.'); setFormOpen(false); setEditTarget(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => pajisjetApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pajisjet'] }); toast.success('Pajisja u fshi.'); setDeleteTarget(null); },
  });

  const setF = (k, v) => setFilters((p) => ({ ...p, [k]: v, ...(k !== 'page' && { page: 1 }) }));
  const openEdit = (p) => { setEditTarget(p); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditTarget(null); };
  const handleSubmit = async (payload) => {
    if (editTarget) await updateMut.mutateAsync({ id: editTarget.pajisje_id, payload });
    else await createMut.mutateAsync(payload);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <p className="text-[13px] text-slate-400 font-medium">
          {pagination?.total != null ? `${pagination.total} pajisje në katalog` : 'Katalogu i telefonave dhe pajisjeve'}
        </p>
        <button onClick={() => { setEditTarget(null); setFormOpen(true); }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7c5cdb] to-[#a78bfa] hover:from-[#6d4fcb] hover:to-[#9370f0] text-white text-[13px] font-bold px-4 py-2.5 rounded-xl shadow-[0_2px_12px_rgba(124,92,219,0.35)] transition-all">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
          <input type="text" placeholder="Kërko model, markë..." value={filters.search}
            onChange={(e) => setF('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#f0edf8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7c5cdb]/30 focus:border-[#7c5cdb]/40" />
        </div>
        <select value={filters.disponueshme} onChange={(e) => setF('disponueshme', e.target.value)}
          className="bg-white border border-[#f0edf8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c5cdb]/30">
          <option value="">Të gjitha</option>
          <option value="1">Disponueshme</option>
          <option value="0">Joaktive</option>
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>
      ) : isError ? (
        <p className="text-center py-24 text-sm text-slate-500">Ndodhi një gabim.</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-semibold">Nuk u gjetën pajisje.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((p) => (
            <PajisjeCard key={p.pajisje_id} p={p} onEdit={openEdit} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-500">Duke shfaqur {pagination.from}–{pagination.to} nga {pagination.total}</p>
          <div className="flex gap-2">
            <button disabled={filters.page <= 1} onClick={() => setF('page', filters.page - 1)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50">Prapa</button>
            <span className="px-4 py-2 text-sm font-black">{filters.page} / {pagination.last_page}</span>
            <button disabled={filters.page >= pagination.last_page} onClick={() => setF('page', filters.page + 1)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50">Para</button>
          </div>
        </div>
      )}

      <Modal isOpen={formOpen} onClose={closeForm} title={editTarget ? 'Ndrysho pajisjen' : 'Shto pajisje të re'} size="md">
        <PajisjeForm initialData={editTarget} onSubmit={handleSubmit} onCancel={closeForm} loading={createMut.isPending || updateMut.isPending} />
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMut.mutate(deleteTarget?.pajisje_id)}
        title="Fshi pajisjen?" message={`A jeni të sigurt që doni të fshini "${deleteTarget?.emri ?? ''}"?`}
        confirmLabel="Po, fshi" loading={deleteMut.isPending} />
    </div>
  );
}
