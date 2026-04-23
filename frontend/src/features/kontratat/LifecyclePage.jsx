import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tanApi } from '../../api/tanApi.js';
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

export default function LifecyclePage() {
  const navigate = useNavigate();

  const { data: kontratat = [], isLoading } = useQuery({
    queryKey: ['kontratat-skaduese'],
    queryFn:  () => tanApi.skaduese().then((r) => r.data),
    refetchInterval: 60000,
  });

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
            <Stat label="Urgjente (≤14d)" value={kontratat.filter(k => k.ditet_mbetur <= 14).length} color="red" />
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
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Penaliteti ndërprerje sot</p>
                        <p className="text-base font-black text-red-700">{Number(k.penaliteti).toFixed(2)}€</p>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => navigate(`/klientet/${k.klient?.klient_id}`)}
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
