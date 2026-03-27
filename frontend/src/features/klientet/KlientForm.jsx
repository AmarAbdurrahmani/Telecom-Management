import { useState, useEffect } from 'react';

const LLOJET   = ['individual', 'biznes', 'vip'];
const STATUSET = ['aktiv', 'pasiv', 'pezulluar'];

const EMPTY_FORM = {
  emri:               '',
  mbiemri:            '',
  numri_personal:     '',
  email:              '',
  telefoni:           '',
  adresa:             '',
  lloji_klientit:     'individual',
  statusi:            'aktiv',
  data_regjistrimit:  '',
};

/**
 * Props:
 *  - initialData: klient object for edit mode (null for create)
 *  - onSubmit: async (formData) => void
 *  - onCancel: () => void
 *  - loading: boolean
 */
export default function KlientForm({ initialData = null, onSubmit, onCancel, loading = false }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        emri:              initialData.emri               ?? '',
        mbiemri:           initialData.mbiemri            ?? '',
        numri_personal:    initialData.numri_personal      ?? '',
        email:             initialData.email              ?? '',
        telefoni:          initialData.telefoni           ?? '',
        adresa:            initialData.adresa             ?? '',
        lloji_klientit:    initialData.lloji_klientit     ?? 'individual',
        statusi:           initialData.statusi            ?? 'aktiv',
        data_regjistrimit: initialData.data_regjistrimit  ?? '',
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
      await onSubmit(form);
    } catch (err) {
      // Map server-side validation errors to fields
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) setErrors(serverErrors);
    }
  };

  const fieldClass = (field) =>
    `w-full border rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
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
      {/* Row: Emri + Mbiemri */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Emri *</label>
          <input
            type="text"
            required
            value={form.emri}
            onChange={set('emri')}
            placeholder="Artan"
            className={fieldClass('emri')}
          />
          <FieldError field="emri" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mbiemri *</label>
          <input
            type="text"
            required
            value={form.mbiemri}
            onChange={set('mbiemri')}
            placeholder="Berisha"
            className={fieldClass('mbiemri')}
          />
          <FieldError field="mbiemri" />
        </div>
      </div>

      {/* Numri Personal */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Numri Personal *</label>
        <input
          type="text"
          required
          value={form.numri_personal}
          onChange={set('numri_personal')}
          placeholder="I12345678A"
          className={fieldClass('numri_personal')}
        />
        <FieldError field="numri_personal" />
      </div>

      {/* Row: Email + Telefoni */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={set('email')}
            placeholder="artan@email.com"
            className={fieldClass('email')}
          />
          <FieldError field="email" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Telefoni *</label>
          <input
            type="text"
            required
            value={form.telefoni}
            onChange={set('telefoni')}
            placeholder="+355 69 123 4567"
            className={fieldClass('telefoni')}
          />
          <FieldError field="telefoni" />
        </div>
      </div>

      {/* Adresa */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Adresa *</label>
        <input
          type="text"
          required
          value={form.adresa}
          onChange={set('adresa')}
          placeholder="Rr. Myslym Shyri, Nr. 10, Tiranë"
          className={fieldClass('adresa')}
        />
        <FieldError field="adresa" />
      </div>

      {/* Row: Lloji + Statusi */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Lloji *</label>
          <select value={form.lloji_klientit} onChange={set('lloji_klientit')} className={fieldClass('lloji_klientit')}>
            {LLOJET.map((l) => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
          <FieldError field="lloji_klientit" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Statusi *</label>
          <select value={form.statusi} onChange={set('statusi')} className={fieldClass('statusi')}>
            {STATUSET.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <FieldError field="statusi" />
        </div>
      </div>

      {/* Data Regjistrimit */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Data Regjistrimit *</label>
        <input
          type="date"
          required
          value={form.data_regjistrimit}
          onChange={set('data_regjistrimit')}
          className={fieldClass('data_regjistrimit')}
        />
        <FieldError field="data_regjistrimit" />
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
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          )}
          {initialData ? 'Ruaj ndryshimet' : 'Krijo klientin'}
        </button>
      </div>
    </form>
  );
}
