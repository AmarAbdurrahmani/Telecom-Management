import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { tanApi } from '../../api/tanApi.js';

/**
 * TanGuard — wraps sensitive content behind a Magic TAN verification.
 * Props:
 *  - klientId: number
 *  - children: ReactNode  (shown after verification)
 *  - label: string        (label for the lock screen)
 */
export default function TanGuard({ klientId, children, label = 'të dhëna të ndjeshme' }) {
  const [verified, setVerified] = useState(false);
  const [step, setStep]         = useState('idle'); // idle | requested | verifying
  const [tan, setTan]           = useState('');
  const [generatedTan, setGeneratedTan] = useState(null); // Demo: shown to agent
  const [error, setError]       = useState('');
  const inputRef = useRef(null);

  const generateMut = useMutation({
    mutationFn: () => tanApi.generate(klientId),
    onSuccess: (res) => {
      setGeneratedTan(res.data.tan); // Demo mode — in production remove this
      setStep('requested');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    onError: () => setError('Gabim gjatë gjenerimit të TAN-it.'),
  });

  const verifyMut = useMutation({
    mutationFn: () => tanApi.verify(klientId, tan),
    onSuccess: (res) => {
      if (res.data.valid) {
        setVerified(true);
      } else {
        setError('TAN i gabuar ose i skaduar. Provo sërish.');
        setTan('');
      }
    },
    onError: (e) => {
      setError(e.response?.data?.message ?? 'TAN i gabuar ose i skaduar.');
      setTan('');
    },
  });

  if (verified) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      {step === 'idle' ? (
        /* Lock screen */
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">Qasje e bllokuar</h3>
          <p className="text-sm text-slate-500 mb-6">
            Për të parë <strong>{label}</strong>, klienti duhet të autorizojë qasjen me kodin TAN.
          </p>
          <button
            onClick={() => generateMut.mutate()}
            disabled={generateMut.isPending}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {generateMut.isPending
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Duke gjeneruar...</>
              : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>Kërko TAN nga klienti</>
            }
          </button>
          {error && <p className="mt-3 text-xs text-red-600 font-semibold">{error}</p>}
        </div>
      ) : (
        /* TAN Entry */
        <div className="w-full max-w-sm">
          {/* Demo banner — shows the TAN to agent (remove in production) */}
          {generatedTan && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-5">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">
                DEMO — Kodi TAN i klientit (në prodhim dërgohet vetëm te klienti)
              </p>
              <div className="flex items-center justify-center gap-2">
                {generatedTan.split('').map((d, i) => (
                  <span key={i} className="w-10 h-12 bg-white border-2 border-amber-300 rounded-xl flex items-center justify-center text-2xl font-black text-amber-800 shadow-sm">
                    {d}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-amber-500 text-center mt-2">Skadon pas 10 minutash</p>
            </div>
          )}

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Verifiko TAN-in</p>
                <p className="text-xs text-slate-400">Shkruaj kodin 6-shifror që klienti ka marrë</p>
              </div>
            </div>

            <input
              ref={inputRef}
              type="text"
              maxLength={6}
              value={tan}
              onChange={(e) => { setTan(e.target.value.replace(/\D/g, '')); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && tan.length === 6 && verifyMut.mutate()}
              placeholder="— — — — — —"
              className="w-full text-center text-3xl font-black tracking-[0.4em] border-2 border-slate-200 rounded-xl py-4 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent mb-4"
            />

            {error && <p className="text-xs text-red-600 font-semibold text-center mb-3">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => { setStep('idle'); setTan(''); setGeneratedTan(null); setError(''); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Anulo
              </button>
              <button
                onClick={() => verifyMut.mutate()}
                disabled={tan.length < 6 || verifyMut.isPending}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {verifyMut.isPending
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : 'Verifiko'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
