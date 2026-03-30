import { useState, useEffect } from 'react';

const EMPTY_FORM = {
  emri_sherbimit: '',
  pershkrimi:     '',
  cmimi_mujor:    '',
  aktiv:          true,
};

export default function SherbimForm({ initialData = null, onSubmit, onCancel, loading = false }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        emri_sherbimit: initialData.emri_sherbimit ?? '',
        pershkrimi:     initialData.pershkrimi     ?? '',
        cmimi_mujor:    initialData.cmimi_mujor    ?? '',
        aktiv:          initialData.aktiv          ?? true,
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
      await onSubmit({
        ...form,
        cmimi_mujor: parseFloat(form.cmimi_mujor) || 0,
      });
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
      {/* Emri */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Emri Shërbimit *
        </label>
        <input
          type="text"
          required
          value={form.emri_sherbimit}
          onChange={set('emri_sherbimit')}
          placeholder="p.sh. Roaming Europa"
          className={fieldClass('emri_sherbimit')}
        />
        <FieldError field="emri_sherbimit" />
      </div>

      {/* Pershkrimi */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Përshkrimi
        </label>
        <textarea
          value={form.pershkrimi}
          onChange={set('pershkrimi')}
          rows={3}
          placeholder="Përshkrim i shkurtër i shërbimit shtesë..."
          className={`${fieldClass('pershkrimi')} resize-none`}
        />
        <FieldError field="pershkrimi" />
      </div>

      {/* Cmimi */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Çmimi Mujor (€) *
        </label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={form.cmimi_mujor}
          onChange={set('cmimi_mujor')}
          placeholder="4.99"
          className={fieldClass('cmimi_mujor')}
        />
        <FieldError field="cmimi_mujor" />
      </div>

      {/* Aktiv toggle */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => setForm((prev) => ({ ...prev, aktiv: !prev.aktiv }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            form.aktiv ? 'bg-slate-900' : 'bg-slate-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
              form.aktiv ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm font-semibold text-slate-700">
          {form.aktiv ? 'Shërbimi aktiv' : 'Shërbimi joaktiv'}
        </span>
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
          {initialData ? 'Ruaj ndryshimet' : 'Krijo shërbimin'}
        </button>
      </div>
    </form>
  );
}
