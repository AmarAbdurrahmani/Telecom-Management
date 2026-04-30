import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tanApi } from '../../api/tanApi.js';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function urgencyColor(days) {
  if (days <= 14) return { bar: 'bg-red-500',    badge: 'bg-red-50 text-red-700',    label: 'Urgjent' };
  if (days <= 30) return { bar: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700', label: 'Së shpejti' };
  return             { bar: 'bg-teal-500',    badge: 'bg-teal-50 text-teal-700',   label: 'Normale' };
}

// ─── Renewal Modal ────────────────────────────────────────────────────────────
function RenewalModal({ kontrate, onClose }) {
  const qc = useQueryClient();
  const [result, setResult] = useState(null);

  const renewMutation = useMutation({
    mutationFn: (muajt) => api.post(`/kontratat/${kontrate.kontrate_id}/renew`, { muajt }),
    onSuccess: (res) => {
      setResult(res.data);
      qc.invalidateQueries(['kontratat-skaduese']);
    },
  });

  const cmimi = kontrate.paket?.cmimi_mujor ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,10,30,0.55)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        {!result ? (
          <>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-[15px] font-black text-slate-800">Rinovimi i kontratës</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{kontrate.numri_kontrates} · {kontrate.klient?.emri} {kontrate.klient?.mbiemri}</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contract info */}
            <div className="bg-[#f8f7fc] rounded-xl p-4 mb-5 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paketa</p>
                <p className="text-sm font-bold text-slate-800">{kontrate.paket?.emri_paketes ?? '—'}</p>
                <p className="text-xs text-violet-700 font-black">{Number(cmimi).toFixed(2)}€/muaj</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skadon</p>
                <p className="text-sm font-bold text-slate-800">{fmt(kontrate.data_mbarimit)}</p>
                <p className="text-xs text-slate-500">{kontrate.ditet_mbetur} ditë mbetur</p>
              </div>
            </div>

            {/* Penalty warning */}
            {kontrate.ditet_mbetur > 30 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
                <p className="text-[11px] font-bold text-amber-700">Penalitet rinovimi i hershëm</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Kontrata ka mbi 30 ditë mbetur. Rinovimi i hershëm aplikon penalitet 10% të muajve mbetur.
                </p>
              </div>
            )}

            {/* Renewal options */}
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-3">Zgjidhni periudhën</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[12, 24].map(m => {
                const total = cmimi * m;
                const penalty = kontrate.ditet_mbetur > 30
                  ? Math.round((kontrate.ditet_mbetur / 30) * cmimi * 0.1 * 100) / 100
                  : 0;
                return (
                  <button
                    key={m}
                    onClick={() => renewMutation.mutate(m)}
                    disabled={renewMutation.isPending}
                    className="flex flex-col items-center justify-center p-4 border-2 border-[#f0edf8] rounded-2xl hover:border-violet-400 hover:bg-violet-50 transition-all disabled:opacity-40 group"
                  >
                    <span className="text-2xl font-black text-slate-800 group-hover:text-violet-700">+{m} Muaj</span>
                    <span className="text-sm font-bold text-violet-600 mt-1">{Number(total + penalty).toFixed(2)}€</span>
                    {penalty > 0 && (
                      <span className="text-[10px] text-amber-600 font-semibold mt-0.5">+ {penalty.toFixed(2)}€ penalitet</span>
                    )}
                    <span className="text-[10px] text-slate-400 font-medium mt-1">{Number(cmimi).toFixed(2)}€/muaj</span>
                  </button>
                );
              })}
            </div>

            {renewMutation.isError && (
              <p className="text-xs text-red-600 font-medium text-center mb-3">
                {renewMutation.error?.response?.data?.message ?? 'Ndodhi një gabim.'}
              </p>
            )}

            <button onClick={onClose} className="w-full py-2.5 border border-[#f0edf8] rounded-xl text-[13px] font-bold text-slate-600 hover:bg-[#f8f7fc] transition-colors">
              Anulo
            </button>
          </>
        ) : (
          // Success state
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-[15px] font-black text-slate-800 mb-1">Kontrata u rinovua!</h3>
            <p className="text-[12px] text-slate-500 mb-5">Data e re e mbarimit: <span className="font-black text-violet-700">{fmt(result.new_end)}</span></p>
            <div className="bg-[#f8f7fc] rounded-xl p-4 text-left space-y-2 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Fatura e gjeneruar</span>
                <span className="font-black text-slate-800">{Number(result.fature?.totali).toFixed(2)}€</span>
              </div>
              {result.penaliteti > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Penaliteti i aplikuar</span>
                  <span className="font-bold text-amber-600">{Number(result.penaliteti).toFixed(2)}€</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Statusi faturës</span>
                <span className="font-bold text-amber-600">E papaguar</span>
              </div>
            </div>
            <button onClick={onClose} className="w-full py-2.5 bg-[#7c5cdb] text-white rounded-xl text-[13px] font-bold hover:bg-violet-700 transition-colors">
              Mbyll
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LifecyclePage() {
  const navigate = useNavigate();
  const [renewingId, setRenewingId] = useState(null);

  const { data: kontratat = [], isLoading } = useQuery({
    queryKey: ['kontratat-skaduese'],
    queryFn:  () => tanApi.skaduese().then((r) => r.data),
    refetchInterval: 60000,
  });

  const renewingKontrate = kontratat.find(k => k.kontrate_id === renewingId);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Lifecycle & Rinovimi</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kontratat që skadojnë brenda 90 ditëve</p>
        </div>
        {kontratat.length > 0 && (
          <div className="flex gap-3">
            <Stat label="Skadojnë" value={kontratat.length} color="slate" />
            <Stat label="Urgjente (<=14d)" value={kontratat.filter(k => k.ditet_mbetur <= 14).length} color="red" />
            <Stat label="Këtë muaj" value={kontratat.filter(k => k.ditet_mbetur <= 30).length} color="amber" />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner className="w-10 h-10" /></div>
      ) : kontratat.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-semibold">Nuk ka kontrata që skadojnë brenda 90 ditëve.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {kontratat.map((k) => {
            const urg = urgencyColor(k.ditet_mbetur);
            const cmimi_total = (k.paket?.cmimi_mujor ?? 0) + (k.pajisje?.cmimi_keste ?? 0);
            return (
              <div key={k.kontrate_id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                {/* Urgency bar */}
                <div className={`h-1 ${urg.bar}`} />

                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Client info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${urg.badge}`}>
                          {urg.label} · {k.ditet_mbetur}d
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{k.numri_kontrates}</span>
                      </div>
                      <button
                        onClick={() => navigate(`/klientet/${k.klient?.klient_id}`)}
                        className="text-base font-black text-slate-900 hover:text-violet-700 transition-colors text-left"
                      >
                        {k.klient?.emri} {k.klient?.mbiemri}
                      </button>
                      <p className="text-xs text-slate-400">{k.klient?.email}</p>
                    </div>

                    {/* Plan + Device */}
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Paketa aktuale</p>
                      <p className="text-sm font-bold text-slate-800">{k.paket?.emri_paketes ?? '—'}</p>
                      {k.pajisje && (
                        <p className="text-xs text-slate-500 mt-0.5">+ {k.pajisje.emri} ({Number(k.pajisje.cmimi_keste).toFixed(2)}€/muaj)</p>
                      )}
                      <p className="text-sm font-black text-violet-700 mt-1">{Number(cmimi_total).toFixed(2)}€/muaj</p>
                    </div>

                    {/* Dates + Penalty */}
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Skadon</p>
                      <p className="text-sm font-bold text-slate-800">{fmt(k.data_mbarimit)}</p>
                      <div className="mt-2 bg-red-50 rounded-xl px-3 py-2">
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Penaliteti nderprerje sot</p>
                        <p className="text-base font-black text-red-700">{Number(k.penaliteti).toFixed(2)}€</p>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => setRenewingId(k.kontrate_id)}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        Oferta rinovimi
                      </button>
                      <button
                        onClick={() => navigate(`/klientet/${k.klient?.klient_id}`)}
                        className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        Shiko profilin
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Renewal modal */}
      {renewingKontrate && (
        <RenewalModal
          kontrate={renewingKontrate}
          onClose={() => setRenewingId(null)}
        />
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  const colors = { slate: 'bg-slate-50 text-slate-800', red: 'bg-red-50 text-red-700', amber: 'bg-amber-50 text-amber-700' };
  return (
    <div className={`rounded-xl px-4 py-2.5 text-center ${colors[color]}`}>
      <p className="text-lg font-black">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
    </div>
  );
}
