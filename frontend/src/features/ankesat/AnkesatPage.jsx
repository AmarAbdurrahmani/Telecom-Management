import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ankesatApi } from '../../api/ankesatApi.js';
import AnkesaForm from './AnkesaForm.jsx';
import ClientAvatar from '../../components/ui/ClientAvatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';

// ─── Config ───────────────────────────────────────────────────────────────────
const KATEGORIA_LABELS = {
  teknik:        'Teknik',
  faturim:       'Faturim',
  sherbimi:      'Shërbimi',
  portabiliteti: 'Portabiliteti',
  tjeter:        'Tjetër',
};

const STATUSI_CONFIG = {
  e_re:       { label: 'E re',        cls: 'bg-blue-50   text-blue-700   border-blue-200'  },
  ne_process: { label: 'Në process',  cls: 'bg-amber-50  text-amber-700  border-amber-200' },
  e_zgjidhur: { label: 'E zgjidhur', cls: 'bg-green-50  text-green-700  border-green-200' },
  e_mbyllur:  { label: 'E mbyllur',  cls: 'bg-slate-100 text-slate-500  border-slate-200' },
};

const KATEGORIA_ICONS = {
  teknik: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  faturim: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
    </svg>
  ),
  sherbimi: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  portabiliteti: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  tjeter: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(d) {
  return d ? new Date(d).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}

function StatusBadge({ statusi }) {
  const cfg = STATUSI_CONFIG[statusi] ?? { label: statusi, cls: 'bg-slate-100 text-slate-500 border-slate-200' };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Ankesa Detail Panel ──────────────────────────────────────────────────────
function AnkesaDetail({ ankese, onEdit, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">#{ankese.ankese_id}</span>
              <StatusBadge statusi={ankese.statusi} />
            </div>
            <h2 className="text-lg font-black text-[#111827]">
              {KATEGORIA_LABELS[ankese.kategoria] ?? ankese.kategoria}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Client */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4">
            <ClientAvatar lloji={ankese.klient?.lloji_klientit} size="sm" />
            <div>
              <p className="text-sm font-black text-[#111827]">
                {ankese.klient?.emri} {ankese.klient?.mbiemri}
              </p>
              <p className="text-xs text-slate-400">{ankese.klient?.email}</p>
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Data ankesës</p>
              <p className="text-sm font-black text-slate-800">{fmt(ankese.data_ankeses)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Punonjësi</p>
              <p className="text-sm font-black text-slate-800">{ankese.punonjes?.name ?? '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Data zgjidhjes</p>
              <p className="text-sm font-black text-slate-800">{fmt(ankese.data_zgjidhjes)}</p>
            </div>
          </div>

          {/* Pershkrimi */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Ankesa</p>
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {ankese.pershkrimi}
            </div>
          </div>

          {/* Pergjigja */}
          {ankese.pergjigja && (
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Përgjigja / Zgjidhja</p>
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm text-violet-900 leading-relaxed whitespace-pre-wrap">
                {ankese.pergjigja}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button onClick={onEdit}
            className="w-full py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Ndrysho / Trajtoje
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const STATUSET_FILTER = ['', 'e_re', 'ne_process', 'e_zgjidhur', 'e_mbyllur'];
const STATUSET_LABELS = { '': 'Të gjitha', e_re: 'E re', ne_process: 'Në process', e_zgjidhur: 'E zgjidhur', e_mbyllur: 'E mbyllur' };
const KATEGORITE_FILTER = ['', 'teknik', 'faturim', 'sherbimi', 'portabiliteti', 'tjeter'];

export default function AnkesatPage() {
  const qc = useQueryClient();

  const [filters, setFilters] = useState({ search: '', statusi: '', kategoria: '', page: 1, per_page: 15 });
  const [formOpen, setFormOpen]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [viewing, setViewing]     = useState(null);
  const [deleteTarget, setDelete] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ankesat', filters],
    queryFn:  () => ankesatApi.getAll(filters).then((r) => r.data),
    keepPreviousData: true,
  });

  const ankesat    = data?.data        ?? [];
  const pagination = data?.pagination  ?? null;

  const createMutation = useMutation({
    mutationFn: (payload) => ankesatApi.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ankesat'] }); toast.success('Ankesa u regjistrua.'); setFormOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => ankesatApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ankesat'] });
      toast.success('Ankesa u përditësua.');
      setFormOpen(false);
      setEditing(null);
      setViewing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ankesatApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ankesat'] }); toast.success('Ankesa u fshi.'); setDelete(null); },
  });

  const setFilter = (key, val) => setFilters((p) => ({ ...p, [key]: val, ...(key !== 'page' && { page: 1 }) }));

  const openEdit = (a) => { setEditing(a); setViewing(null); setFormOpen(true); };
  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };

  const handleSubmit = async (payload) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.ankese_id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  // KPI counts from current full dataset
  const counts = { e_re: 0, ne_process: 0, e_zgjidhur: 0, e_mbyllur: 0 };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Ankesat</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination ? `${pagination.total} ankesa gjithsej` : 'Trajtimi i ankesave të klientëve'}
          </p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Ankesë e re
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        {STATUSET_FILTER.map((s) => (
          <button key={s} onClick={() => setFilter('statusi', s)}
            className={`flex-shrink-0 px-4 py-2 text-sm font-bold rounded-xl transition-colors ${
              filters.statusi === s
                ? 'bg-[#111827] text-white'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}>
            {STATUSET_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Search + category filter */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Kërko klient, përshkrim..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-700 focus:border-transparent" />
        </div>
        <select value={filters.kategoria} onChange={(e) => setFilter('kategoria', e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-700">
          <option value="">Të gjitha kategoritë</option>
          {KATEGORITE_FILTER.filter(Boolean).map((k) => (
            <option key={k} value={k}>{KATEGORIA_LABELS[k]}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>
      ) : isError ? (
        <div className="flex justify-center py-24 text-slate-500"><p className="text-sm">Ndodhi një gabim. Provo sërish.</p></div>
      ) : ankesat.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-sm font-semibold">Nuk u gjet asnjë ankesë.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 py-3">Klienti</th>
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 py-3 hidden sm:table-cell">Kategoria</th>
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 py-3">Ankesa</th>
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 py-3 hidden md:table-cell">Punonjësi</th>
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 py-3 hidden lg:table-cell">Data</th>
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 py-3">Statusi</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ankesat.map((a) => (
                <tr key={a.ankese_id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setViewing(a)}>
                  {/* Klienti */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <ClientAvatar lloji={a.klient?.lloji_klientit} size="sm" />
                      <div>
                        <p className="font-bold text-[#111827] text-sm leading-tight">
                          {a.klient?.emri} {a.klient?.mbiemri}
                        </p>
                        <p className="text-[11px] text-slate-400">{a.klient?.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* Kategoria */}
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      <span className="text-slate-500">{KATEGORIA_ICONS[a.kategoria]}</span>
                      {KATEGORIA_LABELS[a.kategoria] ?? a.kategoria}
                    </span>
                  </td>
                  {/* Ankesa snippet */}
                  <td className="px-5 py-3 max-w-[200px]">
                    <p className="text-sm text-slate-700 truncate">{a.pershkrimi}</p>
                  </td>
                  {/* Punonjesi */}
                  <td className="px-5 py-3 hidden md:table-cell">
                    <p className="text-sm text-slate-500">{a.punonjes?.name ?? <span className="text-slate-300 italic">Pa caktuar</span>}</p>
                  </td>
                  {/* Data */}
                  <td className="px-5 py-3 hidden lg:table-cell text-slate-400 text-sm">{fmt(a.data_ankeses)}</td>
                  {/* Statusi */}
                  <td className="px-5 py-3"><StatusBadge statusi={a.statusi} /></td>
                  {/* Actions */}
                  <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(a)} title="Ndrysho"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-violet-700 hover:bg-violet-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => setDelete(a)} title="Fshi"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-500">Duke shfaqur {pagination.from}–{pagination.to} nga {pagination.total}</p>
          <div className="flex gap-2">
            <button disabled={filters.page <= 1} onClick={() => setFilter('page', filters.page - 1)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors">Prapa</button>
            <span className="px-4 py-2 text-sm font-black text-slate-900">{filters.page} / {pagination.last_page}</span>
            <button disabled={filters.page >= pagination.last_page} onClick={() => setFilter('page', filters.page + 1)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors">Para</button>
          </div>
        </div>
      )}

      {/* Detail view */}
      {viewing && (
        <AnkesaDetail
          ankese={viewing}
          onEdit={() => openEdit(viewing)}
          onClose={() => setViewing(null)}
        />
      )}

      {/* Create / Edit modal */}
      <Modal isOpen={formOpen} onClose={closeForm} title={editing ? 'Ndrysho Ankesën' : 'Ankesë e re'} size="lg">
        <AnkesaForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          loading={isMutating}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDelete(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.ankese_id)}
        title="Fshi ankesën?"
        message={`A jeni të sigurt që doni të fshini ankesën #${deleteTarget?.ankese_id}? Ky veprim nuk mund të zhbëhet.`}
        confirmLabel="Po, fshi"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
