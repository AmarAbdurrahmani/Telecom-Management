import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ankesatApi } from '../../api/ankesatApi.js';

const KATEGORITE = ['teknik', 'faturim', 'sherbimi', 'portabiliteti', 'tjeter'];
const STATUSET   = ['e_re', 'ne_process', 'e_zgjidhur', 'e_mbyllur'];

const KATEGORIA_LABELS = {
  teknik:         'Teknik',
  faturim:        'Faturim',
  sherbimi:       'Shërbimi',
  portabiliteti:  'Portabiliteti',
  tjeter:         'Tjetër',
};

const STATUSI_LABELS = {
  e_re:        'E re',
  ne_process:  'Në process',
  e_zgjidhur:  'E zgjidhur',
  e_mbyllur:   'E mbyllur',
};

const EMPTY = {
  klient_id:      '',
  punonjes_id:    '',
  kategoria:      'teknik',
  pershkrimi:     '',
  data_ankeses:   new Date().toISOString().slice(0, 10),
  statusi:        'e_re',
  pergjigja:      '',
  data_zgjidhjes: '',
};

export default function AnkesaForm({ initialData = null, onSubmit, onCancel, loading = false }) {
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const isEdit = !!initialData;

  const { data: klientet = [] } = useQuery({
    queryKey: ['ankesat-klientet'],
    queryFn:  () => ankesatApi.klientetList().then((r) => r.data),
  });

  const { data: punonjesit = [] } = useQuery({
    queryKey: ['ankesat-punonjesit'],
    queryFn:  () => ankesatApi.punonjesitList().then((r) => r.data),
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        klient_id:      initialData.klient_id        ?? '',
        punonjes_id:    initialData.punonjes_id      ?? '',
        kategoria:      initialData.kategoria        ?? 'teknik',
        pershkrimi:     initialData.pershkrimi       ?? '',
        data_ankeses:   initialData.data_ankeses?.slice(0, 10) ?? '',
        statusi:        initialData.statusi          ?? 'e_re',
        pergjigja:      initialData.pergjigja        ?? '',
        data_zgjidhjes: initialData.data_zgjidhjes?.slice(0, 10) ?? '',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [initialData]);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.punonjes_id)    delete payload.punonjes_id;
    if (!payload.pergjigja)      delete payload.pergjigja;
    if (!payload.data_zgjidhjes) delete payload.data_zgjidhjes;
    try {
      await onSubmit(payload);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) setErrors(serverErrors);
    }
  };

  const fieldCls = (field) =>
    `w-full border rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
      errors[field] ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-violet-700'
    }`;

  const FieldError = ({ field }) =>
    errors[field] ? <p className="mt-1 text-xs text-red-600 font-medium">{errors[field][0]}</p> : null;

  const isResolved = ['e_zgjidhur', 'e_mbyllur'].includes(form.statusi);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Klienti */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Klienti *</label>
        <select required value={form.klient_id} onChange={set('klient_id')} className={fieldCls('klient_id')}>
          <option value="">— Zgjidh klientin —</option>
          {klientet.map((k) => (
            <option key={k.klient_id} value={k.klient_id}>
              {k.emri} {k.mbiemri} · {k.email}
            </option>
          ))}
        </select>
        <FieldError field="klient_id" />
      </div>

      {/* Punonjësi + Kategoria */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Punonjësi përgjegjës</label>
          <select value={form.punonjes_id} onChange={set('punonjes_id')} className={fieldCls('punonjes_id')}>
            <option value="">— Pa caktuar —</option>
            {punonjesit.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.pozita ? ` · ${p.pozita}` : ''}
              </option>
            ))}
          </select>
          <FieldError field="punonjes_id" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Kategoria *</label>
          <select required value={form.kategoria} onChange={set('kategoria')} className={fieldCls('kategoria')}>
            {KATEGORITE.map((k) => (
              <option key={k} value={k}>{KATEGORIA_LABELS[k]}</option>
            ))}
          </select>
          <FieldError field="kategoria" />
        </div>
      </div>

      {/* Data + Statusi */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Data e Ankesës *</label>
          <input type="date" required value={form.data_ankeses} onChange={set('data_ankeses')} className={fieldCls('data_ankeses')} />
          <FieldError field="data_ankeses" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Statusi *</label>
          <select required value={form.statusi} onChange={set('statusi')} className={fieldCls('statusi')}>
            {STATUSET.map((s) => (
              <option key={s} value={s}>{STATUSI_LABELS[s]}</option>
            ))}
          </select>
          <FieldError field="statusi" />
        </div>
      </div>

      {/* Përshkrimi */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Përshkrimi i Ankesës *</label>
        <textarea
          required
          rows={4}
          value={form.pershkrimi}
          onChange={set('pershkrimi')}
          placeholder="Përshkruaj problemin e klientit..."
          className={`${fieldCls('pershkrimi')} resize-none`}
        />
        <FieldError field="pershkrimi" />
      </div>

      {/* Përgjigja + Data zgjidhjes (shown when resolving) */}
      <div className={`space-y-4 transition-all ${isResolved ? '' : 'opacity-60'}`}>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Përgjigja / Zgjidhja
            {isResolved && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            required={isResolved}
            rows={3}
            value={form.pergjigja}
            onChange={set('pergjigja')}
            placeholder="Si u zgjidh problemi..."
            className={`${fieldCls('pergjigja')} resize-none`}
          />
          <FieldError field="pergjigja" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Data e Zgjidhjes</label>
          <input type="date" value={form.data_zgjidhjes} onChange={set('data_zgjidhjes')} className={fieldCls('data_zgjidhjes')} />
          <FieldError field="data_zgjidhjes" />
          {isResolved && !form.data_zgjidhjes && (
            <p className="text-[11px] text-slate-400 mt-1">Nëse lihet bosh, vendoset data e sotme automatikisht.</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
          Anulo
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {isEdit ? 'Ruaj ndryshimet' : 'Regjistro Ankesën'}
        </button>
      </div>
    </form>
  );
}
