import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { kontratatApi } from '../../api/kontratatApi.js';
import KontratCard from './KontratCard.jsx';
import KontratForm from './KontratForm.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

const STATUSET_OPTIONS = ['', 'aktive', 'e_skaduar', 'anulluar'];

const STATUSET_LABELS = {
  '':          'Të gjitha statuset',
  aktive:      'Aktive',
  e_skaduar:   'E skaduar',
  anulluar:    'Anulluar',
};

export default function KontratatPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    search:  '',
    statusi: '',
    page:    1,
    per_page: 12,
  });

  const [formOpen, setFormOpen]               = useState(false);
  const [editingKontrate, setEditingKontrate] = useState(null);
  const [deleteTarget, setDeleteTarget]       = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['kontratat', filters],
    queryFn:  () => kontratatApi.getAll(filters).then((r) => r.data),
    keepPreviousData: true,
  });

  const kontratat  = data?.data       ?? [];
  const pagination = data?.pagination ?? null;

  const createMutation = useMutation({
    mutationFn: (payload) => kontratatApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kontratat'] });
      toast.success('Kontrata u krijua me sukses.');
      setFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => kontratatApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kontratat'] });
      toast.success('Kontrata u përditësua me sukses.');
      setFormOpen(false);
      setEditingKontrate(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => kontratatApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kontratat'] });
      toast.success('Kontrata u fshi me sukses.');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => { setEditingKontrate(null); setFormOpen(true); };
  const openEdit   = (k) => { setEditingKontrate(k);   setFormOpen(true); };
  const closeForm  = ()  => { setFormOpen(false); setEditingKontrate(null); };

  const handleFormSubmit = async (formData) => {
    if (editingKontrate) {
      await updateMutation.mutateAsync({ id: editingKontrate.kontrate_id, payload: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Kontratat</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination?.total != null ? `${pagination.total} kontrata gjithsej` : 'Menaxho kontratat me klientët'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Kontratë e re
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
            placeholder="Kërko numër kontrate, klient..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>

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
          <p className="text-sm font-medium">Ndodhi një gabim gjatë ngarkimit të kontratave.</p>
        </div>
      ) : kontratat.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-semibold">Nuk u gjet asnjë kontratë.</p>
          <p className="text-xs mt-1">Ndryshoni filtrat ose shtoni kontratë të re.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {kontratat.map((k) => (
            <KontratCard
              key={k.kontrate_id}
              kontrate={k}
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
        title={editingKontrate ? 'Ndrysho kontratën' : 'Kontratë e re'}
        size="lg"
      >
        <KontratForm
          initialData={editingKontrate}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          loading={isMutating}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.kontrate_id)}
        title="Fshi kontratën?"
        message={`A jeni të sigurt që doni të fshini kontratën "${deleteTarget?.numri_kontrates ?? ''}"? Ky veprim nuk mund të zhbëhet.`}
        confirmLabel="Po, fshi"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
