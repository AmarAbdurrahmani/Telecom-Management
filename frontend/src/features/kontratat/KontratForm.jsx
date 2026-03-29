import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { kontratatApi } from '../../api/kontratatApi.js';
import Spinner from '../../components/ui/Spinner.jsx';

const STATUSET = ['aktive', 'e_skaduar', 'anulluar'];

const EMPTY_FORM = {
  numri_kontrates: '',
  klient_id:       '',
  paket_id:        '',
  data_fillimit:   '',
  data_mbarimit:   '',
  statusi:         'aktive',
};

export default function KontratForm({ initialData = null, onSubmit, onCancel, loading = false }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const { data: klientetData, isLoading: klientetLoading } = useQuery({
    queryKey: ['kontratat-klientet'],
    queryFn:  () => kontratatApi.klientetList().then((r) => r.data),
  });

  const { data: paketaData, isLoading: paketaLoading } = useQuery({
    queryKey: ['kontratat-paketat'],
    queryFn:  () => kontratatApi.paketaList().then((r) => r.data),
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        numri_kontrates: initialData.numri_kontrates ?? '',
        klient_id:       initialData.klient_id       ?? '',
        paket_id:        initialData.paket_id        ?? '',
        data_fillimit:   initialData.data_fillimit   ?? '',
        data_mbarimit:   initialData.data_mbarimit   ?? '',
        statusi:         initialData.statusi         ?? 'aktive',
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
        klient_id: parseInt(form.klient_id),
        paket_id:  parseInt(form.paket_id),
        data_mbarimit: form.data_mbarimit || null,
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

  const isDropdownLoading = klientetLoading || paketaLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Numri kontrates */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Numri Kontratës *
        </label>
        <input
          type="text"
          required
          value={form.numri_kontrates}
          onChange={set('numri_kontrates')}
          placeholder="p.sh. KNT-2026-001"
          className={fieldClass('numri_kontrates')}
        />
        <FieldError field="numri_kontrates" />
      </div>

      {/* Klienti */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Klienti *
        </label>
        {isDropdownLoading ? (
          <div className="flex items-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl">
            <Spinner className="w-4 h-4" />
            <span className="text-sm text-slate-400">Duke ngarkuar...</span>
          </div>
        ) : (
          <select required value={form.klient_id} onChange={set('klient_id')} className={fieldClass('klient_id')}>
            <option value="">-- Zgjidhni klientin --</option>
            {(klientetData ?? []).map((k) => (
              <option key={k.klient_id} value={k.klient_id}>
                {k.emri} {k.mbiemri} — {k.email}
              </option>
            ))}
          </select>
        )}
        <FieldError field="klient_id" />
      </div>

      {/* Paketa */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Paketa *
        </label>
        {isDropdownLoading ? (
          <div className="flex items-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl">
            <Spinner className="w-4 h-4" />
            <span className="text-sm text-slate-400">Duke ngarkuar...</span>
          </div>
        ) : (
          <select required value={form.paket_id} onChange={set('paket_id')} className={fieldClass('paket_id')}>
            <option value="">-- Zgjidhni paketën --</option>
            {(paketaData ?? []).map((p) => (
              <option key={p.paket_id} value={p.paket_id}>
                {p.emri_paketes} — {Number(p.cmimi_mujor).toFixed(2)}€/muaj ({p.lloji_sherbimit})
              </option>
            ))}
          </select>
        )}
        <FieldError field="paket_id" />
      </div>

      {/* Data fillimit + mbarimit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Data Fillimit *
          </label>
          <input
            type="date"
            required
            value={form.data_fillimit}
            onChange={set('data_fillimit')}
            className={fieldClass('data_fillimit')}
          />
          <FieldError field="data_fillimit" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Data Mbarimit
          </label>
          <input
            type="date"
            value={form.data_mbarimit}
            onChange={set('data_mbarimit')}
            className={fieldClass('data_mbarimit')}
          />
          <FieldError field="data_mbarimit" />
        </div>
      </div>

      {/* Statusi */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Statusi *
        </label>
        <select required value={form.statusi} onChange={set('statusi')} className={fieldClass('statusi')}>
          {STATUSET.map((s) => (
            <option key={s} value={s}>
              {s === 'aktive' ? 'Aktive' : s === 'e_skaduar' ? 'E skaduar' : 'Anulluar'}
            </option>
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
          disabled={loading || isDropdownLoading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          )}
          {initialData ? 'Ruaj ndryshimet' : 'Krijo kontratën'}
        </button>
      </div>
    </form>
  );
}
