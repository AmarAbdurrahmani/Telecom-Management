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

const ARSYET_KOMPENSIMIT = [
  'Mungesë Shërbimi (Teknik)',
  'Vonesë në Instalim',
  'Gabim në Faturim',
  'Ndërprerje e Fibrit (Avari)',
  'Problem me Pajisje (Hardware)',
  'Premtim i Pambajtur (Marketing)',
  'Shpejtësi e Ulët (Bandwidth)',
  'Faturim i Dyfishtë',
  'Kompensim Mirëbesimi (Loyalty)',
  'Gabim i Agjentit',
];

const KANALET = [
  { value: 'email',  label: '✉ Email (Primar)' },
  { value: 'sms',    label: '💬 SMS (Emergjent)' },
  { value: 'poste',  label: '📬 Postë (Zyrtar)' },
  { value: 'portal', label: '🌐 Portal (Self-Service)' },
];

const EMPTY = {
  klient_id:            '',
  punonjes_id:          '',
  kategoria:            'teknik',
  pershkrimi:           '',
  data_ankeses:         new Date().toISOString().slice(0, 10),
  statusi:              'e_re',
  pergjigja:            '',
  data_zgjidhjes:       '',
  ka_kompensim:         false,
  arsyeja_kompensimit:  '',
  shuma_kompensimit:    '',
  kanali_njoftimit:     'email',
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
        klient_id:            initialData.klient_id             ?? '',
        punonjes_id:          initialData.punonjes_id           ?? '',
        kategoria:            initialData.kategoria             ?? 'teknik',
        pershkrimi:           initialData.pershkrimi            ?? '',
        data_ankeses:         initialData.data_ankeses?.slice(0, 10) ?? '',
        statusi:              initialData.statusi               ?? 'e_re',
        pergjigja:            initialData.pergjigja             ?? '',
        data_zgjidhjes:       initialData.data_zgjidhjes?.slice(0, 10) ?? '',
        ka_kompensim:         initialData.ka_kompensim          ?? false,
        arsyeja_kompensimit:  initialData.arsyeja_kompensimit   ?? '',
        shuma_kompensimit:    initialData.shuma_kompensimit      ?? '',
        kanali_njoftimit:     initialData.kanali_njoftimit       ?? 'email',
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
    if (!payload.ka_kompensim) {
      delete payload.arsyeja_kompensimit;
      delete payload.shuma_kompensimit;
    }
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

      {/* ── Kompensimi ── */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, ka_kompensim: !p.ka_kompensim }))}
          className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors ${
            form.ka_kompensim
              ? 'bg-emerald-700 text-white'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Kompenso Klientin
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
            form.ka_kompensim ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            {form.ka_kompensim ? 'AKTIV' : 'JO'}
          </span>
        </button>

        {form.ka_kompensim && (
          <div className="px-4 py-4 space-y-4 bg-emerald-50/50">
            {/* 10 arsyet — clickable grid */}
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Arsyeja e Kompensimit *</p>
              <div className="grid grid-cols-1 gap-1.5">
                {ARSYET_KOMPENSIMIT.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, arsyeja_kompensimit: a }))}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      form.arsyeja_kompensimit === a
                        ? 'bg-emerald-700 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-700'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <FieldError field="arsyeja_kompensimit" />
            </div>

            {/* Shuma + Kanali */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Shuma (€) *</label>
                <input
                  type="number" min="0" step="0.01"
                  value={form.shuma_kompensimit}
                  onChange={set('shuma_kompensimit')}
                  placeholder="0.00"
                  className={fieldCls('shuma_kompensimit')}
                />
                <FieldError field="shuma_kompensimit" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Kanali Njoftimit</label>
                <select value={form.kanali_njoftimit} onChange={set('kanali_njoftimit')} className={fieldCls('kanali_njoftimit')}>
                  {KANALET.map((k) => (
                    <option key={k.value} value={k.value}>{k.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-3 py-2 rounded-lg">
              Shuma do të shtohet si kredit në llogarinë e klientit automatikisht pas ruajtjes.
            </p>
          </div>
        )}
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
