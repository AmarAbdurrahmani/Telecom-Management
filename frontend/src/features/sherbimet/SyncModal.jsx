import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { sherbimetShtesaApi } from '../../api/sherbimetShtesaApi.js';
import Modal from '../../components/ui/Modal.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

/**
 * Modal for assigning contracts to a service (N:M sync).
 * Props: sherbim (object), isOpen, onClose
 */
export default function SyncModal({ sherbim, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState([]);

  const { data: kontratat, isLoading } = useQuery({
    queryKey: ['sherbimet-kontratat'],
    queryFn:  () => sherbimetShtesaApi.kontratatList().then((r) => r.data),
    enabled:  isOpen,
  });

  const { data: sherbimDetail } = useQuery({
    queryKey: ['sherbim-detail', sherbim?.sherbim_id],
    queryFn:  () => sherbimetShtesaApi.getById(sherbim.sherbim_id).then((r) => r.data),
    enabled:  isOpen && !!sherbim,
  });

  // Pre-select already linked contracts
  useEffect(() => {
    if (sherbimDetail?.kontratat) {
      setSelected(sherbimDetail.kontratat.map((k) => k.kontrate_id));
    }
  }, [sherbimDetail]);

  const syncMutation = useMutation({
    mutationFn: () => sherbimetShtesaApi.syncKontratat(sherbim.sherbim_id, selected),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sherbimet-shtesa'] });
      toast.success('Kontratat u caktuan me sukses.');
      onClose();
    },
  });

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Cakto kontratat — ${sherbim?.emri_sherbimit ?? ''}`} size="md">
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Zgjidhni kontratat aktive që do të marrin këtë shërbim shtesë.
          </p>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {(kontratat ?? []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Nuk ka kontrata aktive.</p>
            ) : (
              (kontratat ?? []).map((k) => {
                const checked = selected.includes(k.kontrate_id);
                return (
                  <label
                    key={k.kontrate_id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                      checked
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(k.kontrate_id)}
                      className="w-4 h-4 accent-slate-900"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{k.klient_emri}</p>
                      <p className="text-[11px] text-slate-400 font-semibold">{k.numri_kontrates}</p>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Anulo
            </button>
            <button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {syncMutation.isPending && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              Ruaj caktimin ({selected.length})
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
