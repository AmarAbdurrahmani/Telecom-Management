import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { numratTelefonitApi } from '../../api/numratTelefonitApi.js';
import NumriCard from './NumriCard.jsx';
import NumriForm from './NumriForm.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

const STATUSET_OPTIONS = ['', 'aktiv', 'joaktiv', 'i_rezervuar', 'i_portuar'];
const LLOJET_OPTIONS   = ['', 'prepaid', 'postpaid', 'biznes'];

const STATUSET_LABELS = {
  '':           'Të gjitha statuset',
  aktiv:        'Aktiv',
  joaktiv:      'Joaktiv',
  i_rezervuar:  'I rezervuar',
  i_portuar:    'I portuar',
};

const LLOJET_LABELS = {
  '':       'Të gjitha llojet',
  prepaid:  'Prepaid',
  postpaid: 'Postpaid',
  biznes:   'Biznes',
};

export default function NumratPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    search:   '',
    statusi:  '',
    lloji:    '',
    page:     1,
    per_page: 12,
  });

  const [formOpen, setFormOpen]       = useState(false);
  const [editingNumri, setEditingNumri] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['numrat-telefonit', filters],
    queryFn:  () => numratTelefonitApi.getAll(filters).then((r) => r.data),
    keepPreviousData: true,
  });

  const numrat     = data?.data       ?? [];
  const pagination = data?.pagination ?? null;

  const createMutation = useMutation({
    mutationFn: (payload) => numratTelefonitApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['numrat-telefonit'] });
      toast.success('Numri u shtua me sukses.');
      setFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => numratTelefonitApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['numrat-telefonit'] });
      toast.success('Numri u përditësua me sukses.');
      setFormOpen(false);
      setEditingNumri(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => numratTelefonitApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['numrat-telefonit'] });
      toast.success('Numri u fshi me sukses.');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => { setEditingNumri(null); setFormOpen(true); };
  const openEdit   = (n) => { setEditingNumri(n);   setFormOpen(true); };
  const closeForm  = ()  => { setFormOpen(false); setEditingNumri(null); };

  const handleFormSubmit = async (formData) => {
    if (editingNumri) {
      await updateMutation.mutateAsync({ id: editingNumri.numri_id, payload: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value, ...(key !== 'page' && { page: 1 }) }));

  const isMutating = createMutation.isPending || updateMutation.isPending;

  // Summary counts
  const totalAktiv      = numrat.filter((n) => n.statusi === 'aktiv').length;
  const totalRezervuar  = numrat.filter((n) => n.statusi === 'i_rezervuar').length;
  const totalLire       = numrat.filter((n) => !n.kontrate_id).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Numrat e Telefonit</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination?.total != null ? `${pagination.total} numra gjithsej` : 'Menaxho caktimin e numrave'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Shto numër
        </button>
      </div>

      {/* Summary pills */}
      {numrat.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: 'Aktivë',     count: totalAktiv,     color: 'bg-green-50 text-green-700' },
            { label: 'Të rezervuar', count: totalRezervuar, color: 'bg-amber-50 text-amber-700' },
            { label: 'Të lirë',    count: totalLire,      color: 'bg-sky-50 text-sky-700' },
          ].map((s) => (
            <span key={s.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${s.color}`}>
              {s.label}: {s.count}
            </span>
          ))}
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
            placeholder="Kërko numër, klient..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>

        <select
          value={filters.lloji}
          onChange={(e) => handleFilterChange('lloji', e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
        >
          {LLOJET_OPTIONS.map((l) => (
            <option key={l} value={l}>{LLOJET_LABELS[l]}</option>
          ))}
        </select>

        <select
          value={filters.statusi}
          onChange={(e) => handleFilterChange('statusi', e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
        >
          {STATUSET_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUSET_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner className="w-10 h-10" />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-24 text-slate-500">
          <p className="text-sm font-medium">Ndodhi një gabim gjatë ngarkimit të numrave.</p>
        </div>
      ) : numrat.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <p className="text-sm font-semibold">Nuk u gjet asnjë numër.</p>
          <p className="text-xs mt-1">Ndryshoni filtrat ose shtoni numër të ri.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {numrat.map((n) => (
            <NumriCard
              key={n.numri_id}
              numri={n}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between mt-8">
          <p className="text-sm text-slate-500">
            Duke shfaqur {pagination.from}–{pagination.to} nga {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={filters.page <= 1}
              onClick={() => handleFilterChange('page', filters.page - 1)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Prapa
            </button>
            <span className="px-4 py-2 text-sm font-black text-slate-900">
              {filters.page} / {pagination.last_page}
            </span>
            <button
              disabled={filters.page >= pagination.last_page}
              onClick={() => handleFilterChange('page', filters.page + 1)}
              className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Para
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        title={editingNumri ? 'Ndrysho numrin' : 'Shto numër të ri'}
        size="md"
      >
        <NumriForm
          initialData={editingNumri}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          loading={isMutating}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.numri_id)}
        title="Fshi numrin?"
        message={`A jeni të sigurt që doni të fshini numrin "${deleteTarget?.numri_telefonit ?? ''}"? Ky veprim nuk mund të zhbëhet.`}
        confirmLabel="Po, fshi"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
