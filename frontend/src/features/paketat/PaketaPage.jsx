import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { paketaApi } from '../../api/paketaApi.js';
import PaketCard from './PaketCard.jsx';
import PaketForm from './PaketForm.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

const LLOJET_OPTIONS = ['', 'internet', 'telefoni', 'tv', 'combo'];

export default function PaketaPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    search:          '',
    lloji_sherbimit: '',
    aktive:          '',
    page:            1,
    per_page:        12,
  });

  const [formOpen, setFormOpen]         = useState(false);
  const [editingPaket, setEditingPaket] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['paketat', filters],
    queryFn:  () => paketaApi.getAll(filters).then((r) => r.data),
    keepPreviousData: true,
  });

  const paketat    = data?.data        ?? [];
  const pagination = data?.pagination  ?? null;

  const createMutation = useMutation({
    mutationFn: (payload) => paketaApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paketat'] });
      toast.success('Paketa u krijua me sukses.');
      setFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => paketaApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paketat'] });
      toast.success('Paketa u përditësua me sukses.');
      setFormOpen(false);
      setEditingPaket(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => paketaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paketat'] });
      toast.success('Paketa u fshi me sukses.');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => { setEditingPaket(null); setFormOpen(true); };
  const openEdit   = (p) => { setEditingPaket(p);   setFormOpen(true); };
  const closeForm  = ()  => { setFormOpen(false); setEditingPaket(null); };

  const handleFormSubmit = async (formData) => {
    if (editingPaket) {
      await updateMutation.mutateAsync({ id: editingPaket.paket_id, payload: formData });
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
          <h1 className="text-2xl font-black text-slate-900">Paketat</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination?.total != null ? `${pagination.total} paketa gjithsej` : 'Menaxho paketat e shërbimeve'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Paketë e re
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
            placeholder="Kërko emër pakete..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>

        <select
          value={filters.lloji_sherbimit}
          onChange={(e) => handleFilterChange('lloji_sherbimit', e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
        >
          <option value="">Të gjitha llojet</option>
          {LLOJET_OPTIONS.filter(Boolean).map((l) => (
            <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </select>

        <select
          value={filters.aktive}
          onChange={(e) => handleFilterChange('aktive', e.target.value)}
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
          <p className="text-sm font-medium">Ndodhi një gabim gjatë ngarkimit të paketave.</p>
        </div>
      ) : paketat.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-sm font-semibold">Nuk u gjet asnjë paketë.</p>
          <p className="text-xs mt-1">Ndryshoni filtrat ose shtoni paketë të re.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {paketat.map((paket) => (
            <PaketCard
              key={paket.paket_id}
              paket={paket}
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
        title={editingPaket ? 'Ndrysho paketën' : 'Paketë e re'}
        size="lg"
      >
        <PaketForm
          initialData={editingPaket}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          loading={isMutating}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.paket_id)}
        title="Fshi paketën?"
        message={`A jeni të sigurt që doni të fshini "${deleteTarget?.emri_paketes ?? ''}"? Ky veprim nuk mund të zhbëhet.`}
        confirmLabel="Po, fshi"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
