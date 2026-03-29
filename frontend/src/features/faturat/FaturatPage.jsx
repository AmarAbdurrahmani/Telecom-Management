import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { faturatApi } from '../../api/faturatApi.js';
import FatureCard from './FatureCard.jsx';
import FatureForm from './FatureForm.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

const STATUSET_OPTIONS = ['', 'e_papaguar', 'e_paguar', 'e_vonuar', 'anulluar'];
const STATUSET_LABELS  = {
  '':          'Të gjitha statuset',
  e_papaguar:  'E papaguar',
  e_paguar:    'E paguar',
  e_vonuar:    'E vonuar',
  anulluar:    'Anulluar',
};

export default function FaturatPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    search:   '',
    statusi:  '',
    page:     1,
    per_page: 12,
  });

  const [formOpen, setFormOpen]           = useState(false);
  const [editingFature, setEditingFature] = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['faturat', filters],
    queryFn:  () => faturatApi.getAll(filters).then((r) => r.data),
    keepPreviousData: true,
  });

  const faturat    = data?.data       ?? [];
  const pagination = data?.pagination ?? null;

  const createMutation = useMutation({
    mutationFn: (payload) => faturatApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faturat'] });
      toast.success('Fatura u krijua me sukses.');
      setFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => faturatApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faturat'] });
      toast.success('Fatura u përditësua me sukses.');
      setFormOpen(false);
      setEditingFature(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => faturatApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faturat'] });
      toast.success('Fatura u fshi me sukses.');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => { setEditingFature(null); setFormOpen(true); };
  const openEdit   = (f) => { setEditingFature(f);   setFormOpen(true); };
  const closeForm  = ()  => { setFormOpen(false); setEditingFature(null); };

  const handleFormSubmit = async (formData) => {
    if (editingFature) {
      await updateMutation.mutateAsync({ id: editingFature.fature_id, payload: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const isMutating = createMutation.isPending || updateMutation.isPending;

  // Summary stats
  const totalFaturat  = pagination?.total ?? 0;
  const totalPaguar   = faturat.filter((f) => f.statusi === 'e_paguar').length;
  const totalPapaguar = faturat.filter((f) => f.statusi === 'e_papaguar').length;
  const totalVonuar   = faturat.filter((f) => f.statusi === 'e_vonuar').length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Faturat</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {totalFaturat > 0 ? `${totalFaturat} fatura gjithsej` : 'Menaxho gjenerimin e faturave'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Faturë e re
        </button>
      </div>

      {/* Status summary pills */}
      {faturat.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: 'Të paguara',   count: totalPaguar,   color: 'bg-green-50 text-green-700' },
            { label: 'Të papaguara', count: totalPapaguar, color: 'bg-amber-50 text-amber-700' },
            { label: 'Të vonuara',   count: totalVonuar,   color: 'bg-red-50 text-red-700' },
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
            placeholder="Kërko periudhë, klient, kontratë..."
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
          <p className="text-sm font-medium">Ndodhi një gabim gjatë ngarkimit të faturave.</p>
        </div>
      ) : faturat.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
          <p className="text-sm font-semibold">Nuk u gjet asnjë faturë.</p>
          <p className="text-xs mt-1">Ndryshoni filtrat ose shtoni faturë të re.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {faturat.map((f) => (
            <FatureCard
              key={f.fature_id}
              fature={f}
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
        title={editingFature ? 'Ndrysho faturën' : 'Faturë e re'}
        size="lg"
      >
        <FatureForm
          initialData={editingFature}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          loading={isMutating}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.fature_id)}
        title="Fshi faturën?"
        message={`A jeni të sigurt që doni të fshini faturën e periudhës "${deleteTarget?.periudha ?? ''}"? Ky veprim nuk mund të zhbëhet.`}
        confirmLabel="Po, fshi"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
