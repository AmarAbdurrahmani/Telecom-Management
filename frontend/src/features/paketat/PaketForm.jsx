import { useState, useEffect } from 'react';

const LLOJET = ['internet', 'telefoni', 'tv', 'combo'];

const EMPTY_FORM = {
  emri_paketes:    '',
  pershkrimi:      '',
  cmimi_mujor:     '',
  lloji_sherbimit: 'internet',
  shpejtesia_mb:   '',
  minuta:          '',
  sms:             '',
  data_gb:         '',
  aktive:          true,
};

export default function PaketForm({ initialData = null, onSubmit, onCancel, loading = false }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        emri_paketes:    initialData.emri_paketes    ?? '',
        pershkrimi:      initialData.pershkrimi      ?? '',
        cmimi_mujor:     initialData.cmimi_mujor     ?? '',
        lloji_sherbimit: initialData.lloji_sherbimit ?? 'internet',
        shpejtesia_mb:   initialData.shpejtesia_mb   ?? '',
        minuta:          initialData.minuta          ?? '',
        sms:             initialData.sms             ?? '',
        data_gb:         initialData.data_gb         ?? '',
        aktive:          initialData.aktive          ?? true,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [initialData]);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        cmimi_mujor:   form.cmimi_mujor   !== '' ? parseFloat(form.cmimi_mujor)   : null,
        shpejtesia_mb: form.shpejtesia_mb !== '' ? parseInt(form.shpejtesia_mb)   : null,
        minuta:        form.minuta        !== '' ? parseInt(form.minuta)           : null,
        sms:           form.sms           !== '' ? parseInt(form.sms)             : null,
        data_gb:       form.data_gb       !== '' ? parseFloat(form.data_gb)       : null,
      };
      await onSubmit(payload);
    } catch (err) {
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

  const lloji = form.lloji_sherbimit;
  const showInternet = lloji === 'internet' || lloji === 'combo';
  const showTelefoni = lloji === 'telefoni' || lloji === 'combo';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Emri paketes */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Emri i Paketës *</label>
        <input
          type="text"
          required
          value={form.emri_paketes}
          onChange={set('emri_paketes')}
          placeholder="p.sh. Internet 100Mbps"
          className={fieldClass('emri_paketes')}
        />
        <FieldError field="emri_paketes" />
      </div>

      {/* Pershkrimi */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Përshkrimi</label>
        <textarea
          value={form.pershkrimi}
          onChange={set('pershkrimi')}
          rows={2}
          placeholder="Përshkrim i shkurtër i paketës..."
          className={`${fieldClass('pershkrimi')} resize-none`}
        />
        <FieldError field="pershkrimi" />
      </div>

      {/* Row: Cmimi + Lloji */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Cmimi Mujor (€) *</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={form.cmimi_mujor}
            onChange={set('cmimi_mujor')}
            placeholder="9.99"
            className={fieldClass('cmimi_mujor')}
          />
          <FieldError field="cmimi_mujor" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Lloji Shërbimit *</label>
          <select value={form.lloji_sherbimit} onChange={set('lloji_sherbimit')} className={fieldClass('lloji_sherbimit')}>
            {LLOJET.map((l) => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
          <FieldError field="lloji_sherbimit" />
        </div>
      </div>

      {/* Internet fields */}
      {showInternet && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Shpejtësia (Mbps)</label>
            <input
              type="number"
              min="0"
              value={form.shpejtesia_mb}
              onChange={set('shpejtesia_mb')}
              placeholder="100"
              className={fieldClass('shpejtesia_mb')}
            />
            <FieldError field="shpejtesia_mb" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Data (GB)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.data_gb}
              onChange={set('data_gb')}
              placeholder="Unlimited = lër bosh"
              className={fieldClass('data_gb')}
            />
            <FieldError field="data_gb" />
          </div>
        </div>
      )}

      {/* Telefoni fields */}
      {showTelefoni && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Minuta</label>
            <input
              type="number"
              min="0"
              value={form.minuta}
              onChange={set('minuta')}
              placeholder="Unlimited = lër bosh"
              className={fieldClass('minuta')}
            />
            <FieldError field="minuta" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">SMS</label>
            <input
              type="number"
              min="0"
              value={form.sms}
              onChange={set('sms')}
              placeholder="Unlimited = lër bosh"
              className={fieldClass('sms')}
            />
            <FieldError field="sms" />
          </div>
        </div>
      )}

      {/* Aktive toggle */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => setForm((prev) => ({ ...prev, aktive: !prev.aktive }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            form.aktive ? 'bg-slate-900' : 'bg-slate-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
              form.aktive ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm font-semibold text-slate-700">
          {form.aktive ? 'Paketa aktive' : 'Paketa joaktive'}
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
          {initialData ? 'Ruaj ndryshimet' : 'Krijo paketën'}
        </button>
      </div>
    </form>
  );
}
