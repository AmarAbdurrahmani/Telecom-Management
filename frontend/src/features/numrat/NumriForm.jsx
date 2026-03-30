import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { numratTelefonitApi } from '../../api/numratTelefonitApi.js';
import Spinner from '../../components/ui/Spinner.jsx';

const STATUSET = ['aktiv', 'joaktiv', 'i_rezervuar', 'i_portuar'];
const LLOJET   = ['prepaid', 'postpaid', 'biznes'];

const STATUSET_LABELS = {
  aktiv:        'Aktiv',
  joaktiv:      'Joaktiv',
  i_rezervuar:  'I rezervuar',
  i_portuar:    'I portuar',
};

const LLOJET_LABELS = {
  prepaid:  'Prepaid',
  postpaid: 'Postpaid',
  biznes:   'Biznes',
};

const EMPTY_FORM = {
  kontrate_id:       '',
  numri_telefonit:   '',
  statusi:           'aktiv',
  data_aktivizimit:  '',
  lloji:             'postpaid',
};

export default function NumriForm({ initialData = null, onSubmit, onCancel, loading = false }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const { data: kontratatData, isLoading: kontratatLoading } = useQuery({
    queryKey: ['numrat-kontratat'],
    queryFn:  () => numratTelefonitApi.kontratatList().then((r) => r.data),
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        kontrate_id:      initialData.kontrate_id      ?? '',
        numri_telefonit:  initialData.numri_telefonit  ?? '',
        statusi:          initialData.statusi          ?? 'aktiv',
        data_aktivizimit: initialData.data_aktivizimit ?? '',
        lloji:            initialData.lloji            ?? 'postpaid',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [initialData]);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        kontrate_id:      form.kontrate_id      ? parseInt(form.kontrate_id) : null,
        data_aktivizimit: form.data_aktivizimit || null,
      };
      await onSubmit(payload);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) setErrors(serverErrors);
    }
  };

  const fieldClass = (field) =>
    `w-full border rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition bg-white ${
      errors[field]
        ? 'border-red-300 focus:ring-red-400'
        : 'border-slate-200 focus:ring-slate-900'
    }`;

  const FieldError = ({ field }) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-red-600 font-medium">{errors[field][0]}</p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Numri telefonit */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Numri Telefonit *
        </label>
        <input
          type="text"
          required
          value={form.numri_telefonit}
          onChange={set('numri_telefonit')}
          placeholder="+383 44 123 456"
          className={fieldClass('numri_telefonit')}
        />
        <FieldError field="numri_telefonit" />
      </div>

      {/* Lloji + Statusi */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Lloji *
          </label>
          <select required value={form.lloji} onChange={set('lloji')} className={fieldClass('lloji')}>
            {LLOJET.map((l) => (
              <option key={l} value={l}>{LLOJET_LABELS[l]}</option>
            ))}
          </select>
          <FieldError field="lloji" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Statusi *
          </label>
          <select required value={form.statusi} onChange={set('statusi')} className={fieldClass('statusi')}>
            {STATUSET.map((s) => (
              <option key={s} value={s}>{STATUSET_LABELS[s]}</option>
            ))}
          </select>
          <FieldError field="statusi" />
        </div>
      </div>

      {/* Data aktivizimit */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Data Aktivizimit
        </label>
        <input
          type="date"
          value={form.data_aktivizimit}
          onChange={set('data_aktivizimit')}
          className={fieldClass('data_aktivizimit')}
        />
        <FieldError field="data_aktivizimit" />
      </div>

      {/* Kontrata (opsionale) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Kontrata <span className="text-slate-400 font-normal normal-case">(opsionale)</span>
        </label>
        {kontratatLoading ? (
          <div className="flex items-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl">
            <Spinner className="w-4 h-4" />
            <span className="text-sm text-slate-400">Duke ngarkuar...</span>
          </div>
        ) : (
          <select value={form.kontrate_id} onChange={set('kontrate_id')} className={fieldClass('kontrate_id')}>
            <option value="">-- Pa kontratë (i lirë) --</option>
            {(kontratatData ?? []).map((k) => (
              <option key={k.kontrate_id} value={k.kontrate_id}>
                {k.numri_kontrates} — {k.klient_emri}
              </option>
            ))}
          </select>
        )}
        <FieldError field="kontrate_id" />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Anulo
        </button>
        <button
          type="submit"
          disabled={loading || kontratatLoading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          )}
          {initialData ? 'Ruaj ndryshimet' : 'Shto numrin'}
        </button>
      </div>
    </form>
  );
}
