import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { klientetApi } from '../api/klientetApi.js';
import Spinner from '../components/ui/Spinner.jsx';

function StatCard({ label, value, sub, color = 'slate' }) {
  const colors = {
    slate:  'bg-slate-900 text-white',
    blue:   'bg-blue-600 text-white',
    green:  'bg-green-600 text-white',
    amber:  'bg-amber-500 text-white',
  };
  return (
    <div className={`rounded-2xl p-6 ${colors[color]}`}>
      <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-3">{label}</p>
      <p className="text-4xl font-black leading-none mb-1">{value ?? '—'}</p>
      {sub && <p className="text-xs font-medium opacity-60 mt-2">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { data: allData, isLoading }     = useQuery({ queryKey: ['klientet', { per_page: 1 }], queryFn: () => klientetApi.getAll({ per_page: 1 }).then(r => r.data) });
  const { data: aktivData }              = useQuery({ queryKey: ['klientet', { statusi: 'aktiv',     per_page: 1 }], queryFn: () => klientetApi.getAll({ statusi: 'aktiv',     per_page: 1 }).then(r => r.data) });
  const { data: biznesData }             = useQuery({ queryKey: ['klientet', { lloji_klientit: 'biznes', per_page: 1 }], queryFn: () => klientetApi.getAll({ lloji_klientit: 'biznes', per_page: 1 }).then(r => r.data) });
  const { data: vipData }                = useQuery({ queryKey: ['klientet', { lloji_klientit: 'vip',    per_page: 1 }], queryFn: () => klientetApi.getAll({ lloji_klientit: 'vip',    per_page: 1 }).then(r => r.data) });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Ballina</h1>
        <p className="text-sm text-slate-500 mt-0.5">Pasqyra e sistemit</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Klientë gjithsej"
          value={allData?.pagination?.total}
          sub="Bazë totale"
          color="slate"
        />
        <StatCard
          label="Klientë aktivë"
          value={aktivData?.pagination?.total}
          sub="Status aktiv"
          color="green"
        />
        <StatCard
          label="Klientë biznes"
          value={biznesData?.pagination?.total}
          sub="Lloji biznes"
          color="blue"
        />
        <StatCard
          label="Klientë VIP"
          value={vipData?.pagination?.total}
          sub="Lloji VIP"
          color="amber"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-black text-slate-900 mb-4">Veprime të shpejta</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <Link
            to="/klientet"
            className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow group"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-900 transition-colors">
              <svg className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Menaxho Klientët</p>
              <p className="text-xs text-slate-500">Shiko, shto, ndrysho</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
