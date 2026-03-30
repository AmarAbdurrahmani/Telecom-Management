import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/usersApi.js';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

// ─── Role config ─────────────────────────────────────────────────────────────
// Staff roles only — klient accounts are managed from the Clients page
const ROLES = ['admin', 'tl', 'sv', 'agent'];
const ROLE_LABELS = { admin: 'Admin', tl: 'Team Lead', sv: 'Supervisor', agent: 'Agjent' };

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(d) {
  return d ? new Date(d).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}

function initials(name, surname) {
  return `${(name ?? '?').charAt(0)}${(surname ?? '?').charAt(0)}`.toUpperCase();
}

// ─── Modal shell ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Field ───────────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent';
const selectCls = inputCls;

// ─── Create / Edit User Modal ─────────────────────────────────────────────────
function UserModal({ user, onClose }) {
  const qc = useQueryClient();
  const isEdit = !!user;

  const [form, setForm] = useState({
    name:     user?.name  ?? '',
    email:    user?.email ?? '',
    password: '',
    roli:     user?.roli  ?? 'agent',
    aktiv:    user?.aktiv ?? true,
  });
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: isEdit
      ? (data) => usersApi.update(user.id, data)
      : (data) => usersApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); onClose(); },
    onError: (err) => {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
    },
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { name: form.name, email: form.email, roli: form.roli, aktiv: form.aktiv };
    if (!isEdit) payload.password = form.password;
    mutation.mutate(payload);
  }

  return (
    <Modal title={isEdit ? 'Ndrysho Përdoruesin' : 'Shto Përdorues'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Emri i plotë" error={errors.name?.[0]}>
          <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Emri Mbiemri" required />
        </Field>
        <Field label="Email" error={errors.email?.[0]}>
          <input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@example.com" required />
        </Field>
        {!isEdit && (
          <Field label="Fjalëkalimi" error={errors.password?.[0]}>
            <input className={inputCls} type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••" required autoComplete="new-password" />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Roli" error={errors.roli?.[0]}>
            <select className={selectCls} value={form.roli} onChange={(e) => set('roli', e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </Field>
          <Field label="Statusi" error={errors.aktiv?.[0]}>
            <select className={selectCls} value={form.aktiv ? '1' : '0'} onChange={(e) => set('aktiv', e.target.value === '1')}>
              <option value="1">Aktiv</option>
              <option value="0">Joaktiv</option>
            </select>
          </Field>
        </div>

        {mutation.isError && !Object.keys(errors).length && (
          <p className="text-sm text-red-500">{mutation.error?.response?.data?.message ?? 'Ndodhi një gabim.'}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            Anulo
          </button>
          <button type="submit" disabled={mutation.isPending} className="flex-1 py-2.5 rounded-xl bg-violet-700 text-white text-sm font-bold hover:bg-violet-800 transition-colors disabled:opacity-60">
            {mutation.isPending ? 'Duke ruajtur…' : isEdit ? 'Ruaj Ndryshimet' : 'Shto Përdorues'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Reset Password Modal ─────────────────────────────────────────────────────
function ResetPasswordModal({ user, onClose }) {
  const qc = useQueryClient();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [err, setErr] = useState('');

  const mutation = useMutation({
    mutationFn: () => usersApi.resetPassword(user.id, password),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); onClose(); },
    onError: (e) => setErr(e.response?.data?.message ?? 'Ndodhi një gabim.'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) { setErr('Fjalëkalimi duhet të ketë të paktën 6 karaktere.'); return; }
    if (password !== confirm) { setErr('Fjalëkalimet nuk përputhen.'); return; }
    setErr('');
    mutation.mutate();
  }

  return (
    <Modal title={`Reset Fjalëkalimi — ${user.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Fjalëkalimi i ri">
          <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="new-password" />
        </Field>
        <Field label="Konfirmo Fjalëkalimin">
          <input className={inputCls} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required autoComplete="new-password" />
        </Field>
        {err && <p className="text-sm text-red-500">{err}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            Anulo
          </button>
          <button type="submit" disabled={mutation.isPending} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors disabled:opacity-60">
            {mutation.isPending ? 'Duke resetuar…' : 'Reseto Fjalëkalimin'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ user, onClose }) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => usersApi.delete(user.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); onClose(); },
  });
  return (
    <Modal title="Fshi Përdoruesin" onClose={onClose}>
      <p className="text-sm text-slate-600 mb-6">
        A jeni i sigurt që dëshironi të fshini <span className="font-black text-slate-900">{user.name}</span>? Ky veprim nuk mund të kthehet.
      </p>
      {mutation.isError && (
        <p className="text-sm text-red-500 mb-4">{mutation.error?.response?.data?.message ?? 'Ndodhi një gabim.'}</p>
      )}
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
          Anulo
        </button>
        <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-60">
          {mutation.isPending ? 'Duke fshirë…' : 'Fshi'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ roli }) {
  const colors = {
    admin:  'bg-red-100 text-red-700',
    tl:     'bg-purple-100 text-purple-700',
    sv:     'bg-indigo-100 text-indigo-700',
    agent:  'bg-blue-100 text-blue-700',
    klient: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${colors[roli] ?? colors.klient}`}>
      {ROLE_LABELS[roli] ?? roli}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const qc = useQueryClient();

  const [search, setSearch]   = useState('');
  const [roliFilter, setRoliFilter] = useState('');
  const [aktivFilter, setAktivFilter] = useState('');

  const [modal, setModal] = useState(null); // null | { type: 'create'|'edit'|'reset'|'delete', user? }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', search, roliFilter, aktivFilter],
    queryFn: () => usersApi.getAll({
      search:  search  || undefined,
      roli:    roliFilter  || undefined,
      aktiv:   aktivFilter !== '' ? aktivFilter : undefined,
    }).then((r) => r.data),
    keepPreviousData: true,
  });

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  // Quick toggle aktiv via update
  const toggleAktiv = useMutation({
    mutationFn: ({ id, aktiv }) => usersApi.update(id, { aktiv: !aktiv }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Stafi</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination ? `${pagination.total} përdorues gjithsej` : ''}
          </p>
        </div>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Shto Përdorues
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 w-56"
          placeholder="Kërko emër, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          value={roliFilter}
          onChange={(e) => setRoliFilter(e.target.value)}
        >
          <option value="">Të gjitha rolet</option>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <select
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          value={aktivFilter}
          onChange={(e) => setAktivFilter(e.target.value)}
        >
          <option value="">Të gjitha statuset</option>
          <option value="1">Aktiv</option>
          <option value="0">Joaktiv</option>
        </select>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex justify-center py-32"><Spinner className="w-10 h-10" /></div>
      )}
      {isError && (
        <div className="flex justify-center py-32 text-slate-500">
          <p className="text-sm font-medium">Ndodhi një gabim. Provo sërish.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* Table */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            {users.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <p className="text-sm font-semibold">Nuk u gjet asnjë përdorues.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 py-3">Përdoruesi</th>
                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 py-3">Email</th>
                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 py-3">Roli</th>
                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 py-3">Statusi</th>
                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 py-3">Hyrja e fundit</th>
                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 py-3">Regjistruar</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      {/* Avatar + name */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0">
                            {initials(...(u.name ?? '? ?').split(' '))}
                          </div>
                          <span className="font-bold text-slate-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{u.email}</td>
                      <td className="px-5 py-3"><RoleBadge roli={u.roli} /></td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => toggleAktiv.mutate({ id: u.id, aktiv: u.aktiv })}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${
                            u.aktiv
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.aktiv ? 'bg-green-500' : 'bg-slate-400'}`} />
                          {u.aktiv ? 'Aktiv' : 'Joaktiv'}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-slate-400">{fmt(u.last_login_at)}</td>
                      <td className="px-5 py-3 text-slate-400">{fmt(u.created_at)}</td>
                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setModal({ type: 'edit', user: u })}
                            title="Ndrysho"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setModal({ type: 'reset', user: u })}
                            title="Reset Fjalëkalimi"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setModal({ type: 'delete', user: u })}
                            title="Fshi"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
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

          {/* Pagination info */}
          {pagination && pagination.last_page > 1 && (
            <p className="text-xs text-slate-400 font-medium mt-4 text-center">
              Faqja {pagination.current_page} nga {pagination.last_page} · {pagination.total} gjithsej
            </p>
          )}
        </>
      )}

      {/* Modals */}
      {modal?.type === 'create' && <UserModal onClose={() => setModal(null)} />}
      {modal?.type === 'edit'   && <UserModal user={modal.user} onClose={() => setModal(null)} />}
      {modal?.type === 'reset'  && <ResetPasswordModal user={modal.user} onClose={() => setModal(null)} />}
      {modal?.type === 'delete' && <DeleteModal user={modal.user} onClose={() => setModal(null)} />}
    </div>
  );
}
