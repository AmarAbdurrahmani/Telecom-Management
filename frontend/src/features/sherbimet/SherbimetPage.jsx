import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { sherbimetShtesaApi } from '../../api/sherbimetShtesaApi.js';
import SherbimCard from './SherbimCard.jsx';
import SherbimForm from './SherbimForm.jsx';
import SyncModal from './SyncModal.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

export default function SherbimetPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    search:   '',
    aktiv:    '',
    page:     1,
    per_page: 12,
  });

  const [formOpen, setFormOpen]             = useState(false);
  const [editingSherbim, setEditingSherbim] = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [syncTarget, setSyncTarget]         = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['sherbimet-shtesa', filters],
    queryFn:  () => sherbimetShtesaApi.getAll(filters).then((r) => r.data),
    keepPreviousData: true,
  });

  const sherbimet  = data?.data       ?? [];
  const pagination = data?.pagination ?? null;

  const createMutation = useMutation({
    mutationFn: (payload) => sherbimetShtesaApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sherbimet-shtesa'] });
      toast.success('Shërbimi u krijua me sukses.');
      setFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => sherbimetShtesaApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sherbimet-shtesa'] });
      toast.success('Shërbimi u përditësua me sukses.');
      setFormOpen(false);
      setEditingSherbim(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => sherbimetShtesaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sherbimet-shtesa'] });
      toast.success('Shërbimi u fshi me sukses.');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => { setEditingSherbim(null); setFormOpen(true); };
  const openEdit   = (s) => { setEditingSherbim(s);   setFormOpen(true); };
  const closeForm  = ()  => { setFormOpen(false); setEditingSherbim(null); };

  const handleFormSubmit = async (formData) => {
    if (editingSherbim) {
      await updateMutation.mutateAsync({ id: editingSherbim.sherbim_id, payload: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value, ...(key !== 'page' && { page: 1 }) }));

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Shërbimet Shtesë</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination?.total != null ? `${pagination.total} shërbime gjithsej` : 'Menaxho shërbimet shtesë'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Shërbim i ri
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
            placeholder="Kërko emër shërbimi..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
        <select
          value={filters.aktiv}
          onChange={(e) => handleFilterChange('aktiv', e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
        >
          <option value="">Të gjitha</option>
          <option value="1">Aktive</option>
          <option value="0">Joaktive</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner className="w-10 h-10" />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-24 text-slate-500">
          <p className="text-sm font-medium">Ndodhi një gabim gjatë ngarkimit të shërbimeve.</p>
        </div>
      ) : sherbimet.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <p className="text-sm font-semibold">Nuk u gjet asnjë shërbim shtesë.</p>
          <p className="text-xs mt-1">Shtoni shërbimin e parë duke klikuar butonin sipër.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sherbimet.map((s) => (
            <SherbimCard
              key={s.sherbim_id}
              sherbim={s}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onSync={setSyncTarget}
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
        title={editingSherbim ? 'Ndrysho shërbimin' : 'Shërbim i ri'}
        size="md"
      >
        <SherbimForm
          initialData={editingSherbim}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          loading={isMutating}
        />
      </Modal>

      {/* N:M sync modal */}
      <SyncModal
        sherbim={syncTarget}
        isOpen={!!syncTarget}
        onClose={() => setSyncTarget(null)}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.sherbim_id)}
        title="Fshi shërbimin?"
        message={`A jeni të sigurt që doni të fshini "${deleteTarget?.emri_sherbimit ?? ''}"? Do të hiqet edhe nga të gjitha kontratat.`}
        confirmLabel="Po, fshi"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
