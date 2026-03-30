import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi } from '../../api/usersApi.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';

// ─── Config ───────────────────────────────────────────────────────────────────
const ROLES = ['admin', 'tl', 'sv', 'agent'];
const ROLE_LABELS = { admin: 'Admin', tl: 'Team Lead', sv: 'Supervisor', agent: 'Agjent' };

const ROLE_COLORS = {
  admin:  'bg-red-100    text-red-700',
  tl:     'bg-violet-100 text-violet-700',
  sv:     'bg-indigo-100 text-indigo-700',
  agent:  'bg-blue-100   text-blue-700',
};

const DEPARTAMENTET = ['IT', 'Teknik', 'Shitje', 'Mbeshtetje', 'Financa', 'HR', 'Menaxhim', 'Tjeter'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(d) {
  return d
    ? new Date(d).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
}

function initials(name = '') {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : (name[0] ?? '?').toUpperCase();
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const iCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-700 focus:border-transparent transition';
const errCls = (err) => `${iCls} ${err ? 'border-red-300 focus:ring-red-400' : ''}`;

// ─── Staff Form Modal ─────────────────────────────────────────────────────────
function StaffModal({ user, onClose }) {
  const qc    = useQueryClient();
  const isEdit = !!user;

  const [form, setForm] = useState({
    name:         user?.name         ?? '',
    email:        user?.email        ?? '',
    password:     '',
    roli:         user?.roli         ?? 'agent',
    aktiv:        user?.aktiv        ?? true,
    departamenti: user?.departamenti ?? '',
    pozita:       user?.pozita       ?? '',
    telefoni:     user?.telefoni     ?? '',
  });
  const [errors, setErrors] = useState({});

  const mut = useMutation({
    mutationFn: isEdit
      ? (data) => usersApi.update(user.id, data)
      : (data) => usersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success(isEdit ? 'Ndryshimet u ruajtën!' : 'Anëtari i stafit u shtua!');
      onClose();
    },
    onError: (err) => {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
    },
  });

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      name:         form.name,
      email:        form.email,
      roli:         form.roli,
      aktiv:        form.aktiv,
      departamenti: form.departamenti || null,
      pozita:       form.pozita       || null,
      telefoni:     form.telefoni     || null,
    };
    if (!isEdit) payload.password = form.password;
    mut.mutate(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Emri + Email */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Emri i plotë *" error={errors.name?.[0]}>
          <input required value={form.name} onChange={set('name')} placeholder="Emri Mbiemri" className={errCls(errors.name)} />
        </Field>
        <Field label="Email *" error={errors.email?.[0]}>
          <input required type="email" value={form.email} onChange={set('email')} placeholder="email@telecom.al" className={errCls(errors.email)} />
        </Field>
      </div>

      {/* Password (create only) */}
      {!isEdit && (
        <Field label="Fjalëkalimi *" error={errors.password?.[0]}>
          <input required type="password" value={form.password} onChange={set('password')} placeholder="••••••••" autoComplete="new-password" className={errCls(errors.password)} />
        </Field>
      )}

      {/* Roli + Departamenti */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Roli *" error={errors.roli?.[0]}>
          <select required value={form.roli} onChange={set('roli')} className={errCls(errors.roli)}>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </Field>
        <Field label="Departamenti" error={errors.departamenti?.[0]}>
          <select value={form.departamenti} onChange={set('departamenti')} className={errCls(errors.departamenti)}>
            <option value="">— Zgjidh —</option>
            {DEPARTAMENTET.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
      </div>

      {/* Pozita + Telefoni */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Pozita" error={errors.pozita?.[0]}>
          <input value={form.pozita} onChange={set('pozita')} placeholder="p.sh. Inxhinier..." className={errCls(errors.pozita)} />
        </Field>
        <Field label="Telefoni" error={errors.telefoni?.[0]}>
          <input value={form.telefoni} onChange={set('telefoni')} placeholder="+355 6X XXX XXXX" className={errCls(errors.telefoni)} />
        </Field>
      </div>

      {/* Statusi toggle */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, aktiv: !f.aktiv }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.aktiv ? 'bg-violet-700' : 'bg-slate-300'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.aktiv ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span className="text-sm font-medium text-slate-700">{form.aktiv ? 'Aktiv' : 'Joaktiv'}</span>
      </div>

      {mut.isError && !Object.keys(errors).length && (
        <p className="text-sm text-red-500">{mut.error?.response?.data?.message ?? 'Ndodhi një gabim.'}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
          Anulo
        </button>
        <button type="submit" disabled={mut.isPending}
          className="flex-1 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {mut.isPending && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {isEdit ? 'Ruaj ndryshimet' : 'Shto anëtarin'}
        </button>
      </div>
    </form>
  );
}

// ─── Reset Password Modal ─────────────────────────────────────────────────────
function ResetPasswordModal({ user, onClose }) {
  const qc = useQueryClient();
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [err,      setErr]      = useState('');

  const mut = useMutation({
    mutationFn: () => usersApi.resetPassword(user.id, password),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Fjalëkalimi u ndryshua!'); onClose(); },
    onError:    (e) => setErr(e.response?.data?.message ?? 'Ndodhi një gabim.'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) { setErr('Minimumi 6 karaktere.'); return; }
    if (password !== confirm) { setErr('Fjalëkalimet nuk përputhen.'); return; }
    setErr('');
    mut.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-500">Fjalëkalimi i ri për <span className="font-bold text-slate-800">{user.name}</span></p>
      <Field label="Fjalëkalimi i ri">
        <input className={iCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="new-password" />
      </Field>
      <Field label="Konfirmo">
        <input className={iCls} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required autoComplete="new-password" />
      </Field>
      {err && <p className="text-sm text-red-500">{err}</p>}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
          Anulo
        </button>
        <button type="submit" disabled={mut.isPending}
          className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-colors disabled:opacity-60">
          {mut.isPending ? 'Duke resetuar…' : 'Reseto'}
        </button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const qc = useQueryClient();

  const [search,       setSearch]       = useState('');
  const [roliFilter,   setRoliFilter]   = useState('');
  const [deptFilter,   setDeptFilter]   = useState('');
  const [aktivFilter,  setAktivFilter]  = useState('');

  const [createOpen,    setCreateOpen]    = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);
  const [resetTarget,   setResetTarget]   = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);

  const params = {};
  if (search)            params.search       = search;
  if (roliFilter)        params.roli         = roliFilter;
  if (deptFilter)        params.departamenti = deptFilter;
  if (aktivFilter !== '') params.aktiv       = aktivFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['users', params],
    queryFn:  () => usersApi.getAll(params).then((r) => r.data),
  });

  const users      = data?.data        ?? [];
  const pagination = data?.pagination;

  const toggleAktiv = useMutation({
    mutationFn: ({ id, aktiv }) => usersApi.update(id, { aktiv: !aktiv }),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteMut = useMutation({
    mutationFn: usersApi.delete,
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['users'] }); setDeleteTarget(null); toast.success('Anëtari u fshi.'); },
  });

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Menaxhimi i Stafit</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination ? `${pagination.total} anëtarë gjithsej` : ''}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-700 hover:bg-violet-800 text-white text-sm font-bold rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Shto Anëtar
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input
            type="text" placeholder="Kërko emër, email, pozitë..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 focus:border-transparent"
          />
        </div>
        <select value={roliFilter} onChange={(e) => setRoliFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 focus:border-transparent">
          <option value="">Të gjitha rolet</option>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 focus:border-transparent">
          <option value="">Të gjitha departamentet</option>
          {DEPARTAMENTET.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={aktivFilter} onChange={(e) => setAktivFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-700 focus:border-transparent">
          <option value="">Të gjithë</option>
          <option value="1">Aktivë</option>
          <option value="0">Joaktivë</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Spinner /></div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="font-semibold">Nuk u gjet asnjë anëtar stafi</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Anëtari</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Roli</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Departamenti</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Pozita</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Telefoni</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Statusi</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Hyrja e fundit</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                  {/* Avatar + emri */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${ROLE_COLORS[u.roli] ?? 'bg-slate-100 text-slate-600'}`}>
                        <span className="text-xs font-black">{initials(u.name)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Roli */}
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${ROLE_COLORS[u.roli] ?? 'bg-slate-100 text-slate-600'}`}>
                      {ROLE_LABELS[u.roli] ?? u.roli}
                    </span>
                  </td>

                  {/* Departamenti */}
                  <td className="px-5 py-4 hidden md:table-cell">
                    {u.departamenti
                      ? <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">{u.departamenti}</span>
                      : <span className="text-slate-300">—</span>}
                  </td>

                  {/* Pozita */}
                  <td className="px-5 py-4 text-slate-600 text-sm hidden lg:table-cell">
                    {u.pozita || <span className="text-slate-300">—</span>}
                  </td>

                  {/* Telefoni */}
                  <td className="px-5 py-4 text-slate-500 hidden sm:table-cell">
                    {u.telefoni || <span className="text-slate-300">—</span>}
                  </td>

                  {/* Statusi */}
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleAktiv.mutate({ id: u.id, aktiv: u.aktiv })}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${
                        u.aktiv
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${u.aktiv ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {u.aktiv ? 'Aktiv' : 'Joaktiv'}
                    </button>
                  </td>

                  {/* Hyrja e fundit */}
                  <td className="px-5 py-4 text-slate-400 text-xs hidden xl:table-cell">{fmt(u.last_login_at)}</td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditTarget(u)} title="Ndrysho"
                        className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => setResetTarget(u)} title="Reset fjalëkalimi"
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteTarget(u)} title="Fshi"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.last_page > 1 && (
        <p className="text-xs text-slate-400 font-medium text-center">
          Faqja {pagination.current_page} nga {pagination.last_page} · {pagination.total} gjithsej
        </p>
      )}

      {/* ── Modals ── */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Shto Anëtar Stafi">
        <StaffModal onClose={() => setCreateOpen(false)} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Ndrysho Anëtarin e Stafit">
        <StaffModal user={editTarget} onClose={() => setEditTarget(null)} />
      </Modal>

      <Modal isOpen={!!resetTarget} onClose={() => setResetTarget(null)} title="Reseto Fjalëkalimin">
        <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Fshi Anëtarin"
        message={`A jeni i sigurt që dëshironi të fshini ${deleteTarget?.name}? Ky veprim nuk mund të kthehet.`}
        confirmLabel="Fshi"
        onConfirm={() => deleteMut.mutateAsync(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMut.isPending}
      />
    </div>
  );
}
