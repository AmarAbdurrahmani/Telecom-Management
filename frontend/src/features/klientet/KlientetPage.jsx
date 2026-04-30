import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { klientetApi } from '../../api/klientetApi.js';
import KlientCard from './KlientCard.jsx';
import KlientForm from './KlientForm.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

const LLOJET_OPTIONS   = ['', 'individual', 'biznes', 'vip'];
const STATUSET_OPTIONS = ['', 'aktiv', 'pasiv', 'pezulluar'];

export default function KlientetPage() {
  const queryClient = useQueryClient();

  // ---- Filters & pagination ----
  const [filters, setFilters] = useState({
    search:          '',
    lloji_klientit:  '',
    statusi:         '',
    page:            1,
    per_page:        12,
  });

  // ---- Modal state ----
  const [formOpen, setFormOpen]           = useState(false);
  const [editingKlient, setEditingKlient] = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);

  // ---- Query ----
  const { data, isLoading, isError } = useQuery({
    queryKey: ['klientet', filters],
    queryFn:  () => klientetApi.getAll(filters).then((r) => r.data),
    keepPreviousData: true,
  });

  const klientet  = data?.data        ?? [];
  const pagination = data?.pagination ?? null;

  // ---- Mutations ----
  const createMutation = useMutation({
    mutationFn: (payload) => klientetApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['klientet'] });
      toast.success('Klienti u krijua me sukses.');
      setFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => klientetApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['klientet'] });
      toast.success('Klienti u përditësua me sukses.');
      setFormOpen(false);
      setEditingKlient(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => klientetApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['klientet'] });
      toast.success('Klienti u fshi me sukses.');
      setDeleteTarget(null);
    },
  });

  // ---- Handlers ----
  const openCreate = () => { setEditingKlient(null); setFormOpen(true); };
  const openEdit   = (k)  => { setEditingKlient(k);  setFormOpen(true); };
  const closeForm  = ()   => { setFormOpen(false); setEditingKlient(null); };

  const handleFormSubmit = async (formData) => {
    if (editingKlient) {
      await updateMutation.mutateAsync({ id: editingKlient.hash_id, payload: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value, ...(key !== 'page' && { page: 1 }) }));

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Klientët</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination?.total != null ? `${pagination.total} klientë gjithsej` : 'Menaxho bazën e klientëve'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Klient i ri
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Kërko emër, email, numër personal..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-700 focus:border-transparent"
          />
        </div>

        {/* Lloji filter */}
        <select
          value={filters.lloji_klientit}
          onChange={(e) => handleFilterChange('lloji_klientit', e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-700 focus:border-transparent bg-white"
        >
          <option value="">Të gjithë llojet</option>
          {LLOJET_OPTIONS.filter(Boolean).map((l) => (
            <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </select>

        {/* Statusi filter */}
        <select
          value={filters.statusi}
          onChange={(e) => handleFilterChange('statusi', e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-700 focus:border-transparent bg-white"
        >
          <option value="">Të gjitha statuset</option>
          {STATUSET_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
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
          <p className="text-sm font-medium">Ndodhi një gabim gjatë ngarkimit të klientëve.</p>
        </div>
      ) : klientet.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm font-semibold">Nuk u gjet asnjë klient.</p>
          <p className="text-xs mt-1">Ndryshoni filtrat ose shtoni klient të ri.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {klientet.map((klient) => (
            <KlientCard
              key={klient.klient_id}
              klient={klient}
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
        title={editingKlient ? 'Ndrysho klientin' : 'Klient i ri'}
        size="lg"
      >
        <KlientForm
          initialData={editingKlient}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          loading={isMutating}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.hash_id)}
        title="Fshi klientin?"
        message={`A jeni të sigurt që doni të fshini ${deleteTarget?.emri_plote ?? ''}? Ky veprim nuk mund të zhbëhet.`}
        confirmLabel="Po, fshi"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
