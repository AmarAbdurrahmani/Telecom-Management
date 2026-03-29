import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { faturatApi } from '../../api/faturatApi.js';
import Spinner from '../../components/ui/Spinner.jsx';

const STATUSET = ['e_papaguar', 'e_paguar', 'e_vonuar', 'anulluar'];

const STATUSET_LABELS = {
  e_papaguar: 'E papaguar',
  e_paguar:   'E paguar',
  e_vonuar:   'E vonuar',
  anulluar:   'Anulluar',
};

const EMPTY_FORM = {
  kontrate_id:   '',
  periudha:      '',
  shuma_baze:    '',
  shuma_shtese:  '0',
  tatimi:        '0',
  totali:        '',
  data_leshimit: '',
  data_pageses:  '',
  statusi:       'e_papaguar',
};

export default function FatureForm({ initialData = null, onSubmit, onCancel, loading = false }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const { data: kontratatData, isLoading: kontratatLoading } = useQuery({
    queryKey: ['faturat-kontratat'],
    queryFn:  () => faturatApi.kontratatList().then((r) => r.data),
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        kontrate_id:   initialData.kontrate_id   ?? '',
        periudha:      initialData.periudha       ?? '',
        shuma_baze:    initialData.shuma_baze     ?? '',
        shuma_shtese:  initialData.shuma_shtese   ?? '0',
        tatimi:        initialData.tatimi         ?? '0',
        totali:        initialData.totali         ?? '',
        data_leshimit: initialData.data_leshimit  ?? '',
        data_pageses:  initialData.data_pageses   ?? '',
        statusi:       initialData.statusi        ?? 'e_papaguar',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [initialData]);

  // Auto-calculate totali when amounts change
  const recalcTotal = (base, extra, tax) => {
    const b = parseFloat(base)  || 0;
    const e = parseFloat(extra) || 0;
    const t = parseFloat(tax)   || 0;
    return (b + e + t).toFixed(2);
  };

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (['shuma_baze', 'shuma_shtese', 'tatimi'].includes(field)) {
        next.totali = recalcTotal(
          field === 'shuma_baze'   ? value : prev.shuma_baze,
          field === 'shuma_shtese' ? value : prev.shuma_shtese,
          field === 'tatimi'       ? value : prev.tatimi,
        );
      }
      // Auto-fill shuma_baze from selected contract price
      if (field === 'kontrate_id' && kontratatData) {
        const k = kontratatData.find((c) => String(c.kontrate_id) === String(value));
        if (k) {
          next.shuma_baze = String(k.cmimi_mujor);
          next.totali = recalcTotal(k.cmimi_mujor, prev.shuma_shtese, prev.tatimi);
        }
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        kontrate_id:  parseInt(form.kontrate_id),
        shuma_baze:   parseFloat(form.shuma_baze)   || 0,
        shuma_shtese: parseFloat(form.shuma_shtese) || 0,
        tatimi:       parseFloat(form.tatimi)       || 0,
        totali:       parseFloat(form.totali)       || 0,
        data_pageses: form.data_pageses || null,
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
      {/* Kontrata */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Kontrata *
        </label>
        {kontratatLoading ? (
          <div className="flex items-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl">
            <Spinner className="w-4 h-4" />
            <span className="text-sm text-slate-400">Duke ngarkuar...</span>
          </div>
        ) : (
          <select required value={form.kontrate_id} onChange={set('kontrate_id')} className={fieldClass('kontrate_id')}>
            <option value="">-- Zgjidhni kontratën --</option>
            {(kontratatData ?? []).map((k) => (
              <option key={k.kontrate_id} value={k.kontrate_id}>
                {k.numri_kontrates} — {k.klient_emri} · {k.paket_emri}
              </option>
            ))}
          </select>
        )}
        <FieldError field="kontrate_id" />
      </div>

      {/* Periudha */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Periudha *
        </label>
        <input
          type="text"
          required
          value={form.periudha}
          onChange={set('periudha')}
          placeholder="p.sh. Janar 2026"
          className={fieldClass('periudha')}
        />
        <FieldError field="periudha" />
      </div>

      {/* Shumat */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Shuma Bazë (€) *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={form.shuma_baze}
            onChange={set('shuma_baze')}
            placeholder="0.00"
            className={fieldClass('shuma_baze')}
          />
          <FieldError field="shuma_baze" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Shuma Shtesë (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.shuma_shtese}
            onChange={set('shuma_shtese')}
            placeholder="0.00"
            className={fieldClass('shuma_shtese')}
          />
          <FieldError field="shuma_shtese" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Tatimi (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.tatimi}
            onChange={set('tatimi')}
            placeholder="0.00"
            className={fieldClass('tatimi')}
          />
          <FieldError field="tatimi" />
        </div>
      </div>

      {/* Totali - readonly, auto-calculated */}
      <div className="bg-slate-50 rounded-2xl px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Totali</span>
        <span className="text-xl font-black text-slate-900">
          {parseFloat(form.totali || 0).toFixed(2)} €
        </span>
      </div>

      {/* Datat */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Data Lëshimit *
          </label>
          <input
            type="date"
            required
            value={form.data_leshimit}
            onChange={set('data_leshimit')}
            className={fieldClass('data_leshimit')}
          />
          <FieldError field="data_leshimit" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Data Pagesës
          </label>
          <input
            type="date"
            value={form.data_pageses}
            onChange={set('data_pageses')}
            className={fieldClass('data_pageses')}
          />
          <FieldError field="data_pageses" />
        </div>
      </div>

      {/* Statusi */}
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
          {initialData ? 'Ruaj ndryshimet' : 'Krijo faturën'}
        </button>
      </div>
    </form>
  );
}
