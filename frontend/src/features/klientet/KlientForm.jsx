import { useState, useEffect } from 'react';

const LLOJET   = ['individual', 'biznes', 'vip'];
const STATUSET = ['aktiv', 'pasiv', 'pezulluar'];

const EMPTY_FORM = {
  emri: '', mbiemri: '', numri_personal: '', email: '', telefoni: '',
  adresa: '', lloji_klientit: 'individual', statusi: 'aktiv',
  data_regjistrimit: '',
  data_faturimit: '',
  // Portal account
  password: '', portal_aktiv: true,
};

export default function KlientForm({ initialData = null, onSubmit, onCancel, loading = false }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setForm({
        emri:               initialData.emri               ?? '',
        mbiemri:            initialData.mbiemri            ?? '',
        numri_personal:     initialData.numri_personal     ?? '',
        email:              initialData.email              ?? '',
        telefoni:           initialData.telefoni           ?? '',
        adresa:             initialData.adresa             ?? '',
        lloji_klientit:     initialData.lloji_klientit     ?? 'individual',
        statusi:            initialData.statusi            ?? 'aktiv',
        data_regjistrimit:  initialData.data_regjistrimit  ?? '',
        data_faturimit:     initialData.data_faturimit     ?? '',
        password:           '',
        portal_aktiv:       initialData.user?.aktiv        ?? false,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [initialData]);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [field]: val }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    // Only send password if filled
    if (!payload.password) delete payload.password;
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Emri + Mbiemri */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Emri *</label>
          <input type="text" required value={form.emri} onChange={set('emri')} placeholder="Artan" className={fieldCls('emri')} />
          <FieldError field="emri" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mbiemri *</label>
          <input type="text" required value={form.mbiemri} onChange={set('mbiemri')} placeholder="Berisha" className={fieldCls('mbiemri')} />
          <FieldError field="mbiemri" />
        </div>
      </div>

      {/* Numri Personal */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Numri Personal *</label>
        <input type="text" required value={form.numri_personal} onChange={set('numri_personal')} placeholder="I12345678A" className={fieldCls('numri_personal')} />
        <FieldError field="numri_personal" />
      </div>

      {/* Email + Telefoni */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email *</label>
          <input type="email" required value={form.email} onChange={set('email')} placeholder="artan@email.com" className={fieldCls('email')} />
          <FieldError field="email" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Telefoni *</label>
          <input type="text" required value={form.telefoni} onChange={set('telefoni')} placeholder="+383 44 123 456" className={fieldCls('telefoni')} />
          <FieldError field="telefoni" />
        </div>
      </div>

      {/* Adresa */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Adresa</label>
        <input type="text" value={form.adresa} onChange={set('adresa')} placeholder="Rr. Dëshmorët, Prishtinë" className={fieldCls('adresa')} />
        <FieldError field="adresa" />
      </div>

      {/* Lloji + Statusi */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Lloji *</label>
          <select value={form.lloji_klientit} onChange={set('lloji_klientit')} className={fieldCls('lloji_klientit')}>
            {LLOJET.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
          </select>
          <FieldError field="lloji_klientit" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Statusi *</label>
          <select value={form.statusi} onChange={set('statusi')} className={fieldCls('statusi')}>
            {STATUSET.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <FieldError field="statusi" />
        </div>
      </div>

      {/* Data */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Data Regjistrimit *</label>
        <input type="date" required value={form.data_regjistrimit} onChange={set('data_regjistrimit')} className={fieldCls('data_regjistrimit')} />
        <FieldError field="data_regjistrimit" />
      </div>

      {/* Data Faturimit */}
      {isEdit && (
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Cikli i Faturimit
            {initialData?.ndrysho_ciklin_count > 0 && (
              <span className="ml-2 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                {initialData.ndrysho_ciklin_count === 1 ? 'Ndryshimi i 2-të me 5€' : `Ndryshime: ${initialData.ndrysho_ciklin_count}`}
              </span>
            )}
          </label>
          <select value={form.data_faturimit} onChange={set('data_faturimit')} className={fieldCls('data_faturimit')}>
            <option value="">— Pa cikël të caktuar —</option>
            <option value="7">Data 7 e çdo muaji</option>
            <option value="22">Data 22 e çdo muaji</option>
          </select>
          {!initialData?.ndrysho_ciklin_count && (
            <p className="text-[11px] text-slate-400 mt-1">Ndryshimi i parë është falas. I dyti e tutje: 5€.</p>
          )}
          <FieldError field="data_faturimit" />
        </div>
      )}

      {/* ── Portal account section ── */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-violet-100 rounded-md flex items-center justify-center">
            <svg className="w-3 h-3 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Qasja në Portal</p>
          {isEdit && initialData?.user && (
            <span className={`ml-auto text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
              initialData.user.aktiv ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {initialData.user.aktiv ? 'Aktiv' : 'Joaktiv'}
            </span>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            {isEdit ? 'Fjalëkalim i ri (lëre bosh nëse nuk ndryshon)' : 'Fjalëkalimi i portalit *'}
          </label>
          <input
            type="password"
            required={!isEdit}
            value={form.password}
            onChange={set('password')}
            placeholder="••••••••"
            autoComplete="new-password"
            className={fieldCls('password')}
          />
          <FieldError field="password" />
          <p className="text-[11px] text-slate-400 mt-1">
            Klienti do të hyjë me email-in e mësipërm dhe këtë fjalëkalim.
          </p>
        </div>

        {isEdit && (
          <label className="flex items-center gap-2.5 mt-3 cursor-pointer">
            <div
              onClick={() => setForm((p) => ({ ...p, portal_aktiv: !p.portal_aktiv }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.portal_aktiv ? 'bg-violet-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.portal_aktiv ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              Qasja në portal {form.portal_aktiv ? 'aktive' : 'joaktive'}
            </span>
          </label>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
          Anulo
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {isEdit ? 'Ruaj ndryshimet' : 'Krijo klientin'}
        </button>
      </div>
    </form>
  );
}
