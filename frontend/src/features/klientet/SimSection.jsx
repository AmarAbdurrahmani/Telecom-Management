import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { simKartelaApi } from '../../api/simKartelaApi.js';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(d) {
  return d ? new Date(d).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}

const EMPTY_FORM = {
  nr_karteles:   '',
  pin:           '',
  puk:           '',
  tip:           'sim',
  statusi:       'aktive',
  numri_id:      '',
  data_leshimit: '',
  koment:        '',
};

const STATUSET = ['aktive', 'joaktive', 'bllokuar', 'e_zvendesuar'];
const STATUSET_LABELS = {
  aktive:        'Aktive',
  joaktive:      'Joaktive',
  bllokuar:      'Bllokuar',
  e_zvendesuar:  'E Zëvendësuar',
};

// ─── SIM Icon ─────────────────────────────────────────────────────────────────
function SimIcon({ isEsim }) {
  if (isEsim) {
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <rect x="5" y="3" width="14" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6M9 12h6M9 16h4"/>
        </svg>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M7 4h7l4 4v12a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1z"/>
        <rect x="9" y="10" width="6" height="5" rx="1"/>
      </svg>
    </div>
  );
}

// ─── PIN/PUK Field ─────────────────────────────────────────────────────────────
function SecretField({ label, value }) {
  const [show, setShow] = useState(false);
  if (!value) return null;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-bold text-slate-400 uppercase">{label}:</span>
      <span className="text-xs font-mono font-bold text-slate-700">
        {show ? value : '•'.repeat(value.length)}
      </span>
      <button onClick={() => setShow(!show)} className="text-slate-400 hover:text-slate-600 transition-colors">
        {show ? (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ─── SIM Form ─────────────────────────────────────────────────────────────────
function SimForm({ form, setForm, numrat }) {
  const F = (field) => ({
    value: form[field],
    onChange: (e) => setForm((p) => ({ ...p, [field]: e.target.value })),
  });

  return (
    <div className="space-y-4">
      {/* Tip */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-2">Lloji</label>
        <div className="grid grid-cols-2 gap-2">
          {['sim', 'esim'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((p) => ({ ...p, tip: t }))}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                form.tip === t
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <SimIcon isEsim={t === 'esim'} />
              {t === 'esim' ? 'eSIM' : 'SIM Kartelë'}
            </button>
          ))}
        </div>
      </div>

      {/* Nr Karteles */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">
          Nr. Kartelës (ICCID) <span className="text-red-500">*</span>
        </label>
        <input
          {...F('nr_karteles')}
          placeholder="89355..."
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
        />
      </div>

      {/* PIN + PUK */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">PIN</label>
          <input
            {...F('pin')}
            placeholder="1234"
            maxLength={10}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">PUK</label>
          <input
            {...F('puk')}
            placeholder="12345678"
            maxLength={10}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Statusi */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">Statusi</label>
        <select
          {...F('statusi')}
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
        >
          {STATUSET.map((s) => (
            <option key={s} value={s}>{STATUSET_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Numri Telefonit */}
      {numrat?.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Numri i Telefonit</label>
          <select
            {...F('numri_id')}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
          >
            <option value="">— Pa numër —</option>
            {numrat.map((n) => (
              <option key={n.numri_id} value={n.numri_id}>{n.numri_telefonit}</option>
            ))}
          </select>
        </div>
      )}

      {/* Data Leshimit */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">Data e Lëshimit</label>
        <input
          type="date"
          {...F('data_leshimit')}
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
        />
      </div>

      {/* Koment */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">Koment</label>
        <textarea
          {...F('koment')}
          rows={2}
          placeholder="Shënim opsional..."
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none"
        />
      </div>
    </div>
  );
}

// ─── SimSection ───────────────────────────────────────────────────────────────
export default function SimSection({ klientId }) {
  const qc = useQueryClient();
  const [createOpen,  setCreateOpen]  = useState(false);
  const [editTarget,  setEditTarget]  = useState(null); // sim object
  const [deleteTarget,setDeleteTarget]= useState(null); // sim object
  const [form, setForm] = useState(EMPTY_FORM);
  const [err,  setErr]  = useState('');

  const { data: sims = [], isLoading } = useQuery({
    queryKey: ['sims', klientId],
    queryFn:  () => simKartelaApi.getByKlient(klientId).then((r) => r.data),
  });

  const { data: numrat = [] } = useQuery({
    queryKey: ['numrat-per-sim', klientId],
    queryFn:  () => simKartelaApi.numratPerSim(klientId).then((r) => r.data),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['sims', klientId] });
    qc.invalidateQueries({ queryKey: ['numrat-per-sim', klientId] });
    qc.invalidateQueries({ queryKey: ['historia', klientId] });
  };

  const createMut = useMutation({
    mutationFn: (data) => simKartelaApi.store(klientId, data),
    onSuccess:  () => { invalidate(); setCreateOpen(false); setForm(EMPTY_FORM); setErr(''); },
    onError:    (e)  => setErr(e.response?.data?.message ?? 'Gabim gjatë ruajtjes.'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => simKartelaApi.update(id, data),
    onSuccess:  () => { invalidate(); setEditTarget(null); setErr(''); },
    onError:    (e)  => setErr(e.response?.data?.message ?? 'Gabim gjatë ruajtjes.'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => simKartelaApi.delete(id),
    onSuccess:  () => { invalidate(); setDeleteTarget(null); },
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setErr('');
    setCreateOpen(true);
  }

  function openEdit(sim) {
    setForm({
      nr_karteles:   sim.nr_karteles   ?? '',
      pin:           sim.pin           ?? '',
      puk:           sim.puk           ?? '',
      tip:           sim.tip           ?? 'sim',
      statusi:       sim.statusi       ?? 'aktive',
      numri_id:      sim.numri_id      ?? '',
      data_leshimit: sim.data_leshimit ? sim.data_leshimit.substring(0, 10) : '',
      koment:        sim.koment        ?? '',
    });
    setErr('');
    setEditTarget(sim);
  }

  function handleSubmitCreate(e) {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.numri_id) delete payload.numri_id;
    if (!payload.data_leshimit) delete payload.data_leshimit;
    createMut.mutate(payload);
  }

  function handleSubmitEdit(e) {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.numri_id) payload.numri_id = null;
    if (!payload.data_leshimit) payload.data_leshimit = null;
    updateMut.mutate({ id: editTarget.sim_id, data: payload });
  }

  if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-black text-slate-700">
          {sims.length === 0 ? 'Nuk ka SIM kartela.' : `${sims.length} SIM kartela`}
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-[#111827] hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Shto SIM
        </button>
      </div>

      {/* SIM Cards Grid */}
      {sims.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M7 4h7l4 4v12a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1z"/>
              <rect x="9" y="10" width="6" height="5" rx="1"/>
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-500">Nuk ka SIM kartela të regjistruara.</p>
          <p className="text-xs text-slate-400 mt-1">Kliko "Shto SIM" për të shtuar kartelën e parë.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sims.map((sim) => (
            <div key={sim.sim_id} className="bg-white border border-slate-100 rounded-2xl p-5">
              {/* Top row */}
              <div className="flex items-start gap-3 mb-4">
                <SimIcon isEsim={sim.tip === 'esim'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      sim.tip === 'esim'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {sim.tip === 'esim' ? 'eSIM' : 'SIM'}
                    </span>
                    <Badge value={sim.statusi} />
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-1 truncate">
                    {sim.nr_karteles}
                  </p>
                </div>
                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(sim)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                    title="Ndrysho"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(sim)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Fshi"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 bg-slate-50 rounded-xl px-3 py-2.5">
                {sim.numri_telefonit && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-violet-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-xs font-bold text-slate-700">{sim.numri_telefonit.numri_telefonit}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 flex-wrap">
                  <SecretField label="PIN" value={sim.pin} />
                  <SecretField label="PUK" value={sim.puk} />
                </div>
                {sim.data_leshimit && (
                  <p className="text-[10px] font-semibold text-slate-400">Lëshuar: {fmt(sim.data_leshimit)}</p>
                )}
                {sim.koment && (
                  <p className="text-[11px] text-slate-500 italic">{sim.koment}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Shto SIM Kartelë" size="md">
        <form onSubmit={handleSubmitCreate} className="space-y-5">
          <SimForm form={form} setForm={setForm} numrat={numrat} />
          {err && <p className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-lg">{err}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setCreateOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              Anulo
            </button>
            <button type="submit" disabled={createMut.isPending}
              className="flex-1 py-2.5 rounded-xl bg-[#111827] text-white text-sm font-bold hover:bg-slate-700 disabled:opacity-60 transition-colors">
              {createMut.isPending ? 'Duke ruajtur...' : 'Shto SIM'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Ndrysho SIM Kartelë" size="md">
        <form onSubmit={handleSubmitEdit} className="space-y-5">
          <SimForm form={form} setForm={setForm} numrat={[
            ...(editTarget?.numri_telefonit ? [editTarget.numri_telefonit] : []),
            ...numrat,
          ]} />
          {err && <p className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-lg">{err}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setEditTarget(null)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              Anulo
            </button>
            <button type="submit" disabled={updateMut.isPending}
              className="flex-1 py-2.5 rounded-xl bg-[#111827] text-white text-sm font-bold hover:bg-slate-700 disabled:opacity-60 transition-colors">
              {updateMut.isPending ? 'Duke ruajtur...' : 'Ruaj ndryshimet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Fshi SIM Kartelën" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            A jeni i sigurt që doni të fshini kartelën{' '}
            <span className="font-black text-slate-900 font-mono">{deleteTarget?.nr_karteles}</span>?
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              Anulo
            </button>
            <button onClick={() => deleteMut.mutate(deleteTarget.sim_id)} disabled={deleteMut.isPending}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60 transition-colors">
              {deleteMut.isPending ? 'Duke fshirë...' : 'Fshi'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
