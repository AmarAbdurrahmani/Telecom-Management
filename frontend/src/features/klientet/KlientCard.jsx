import { useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge.jsx';
import ClientAvatar from '../../components/ui/ClientAvatar.jsx';

function fmt(d) {
  return d ? new Date(d).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}

export default function KlientCard({ klient, onEdit, onDelete }) {
  const navigate = useNavigate();

  const hasPortal = !!klient.user;
  const portalActive = klient.user?.aktiv;

  return (
    <div
      className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
      onClick={() => navigate(`/klientet/${klient.hash_id}`)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <ClientAvatar lloji={klient.lloji_klientit} size="md" />
          <div>
            <h3 className="text-[15px] font-black text-[#111827] leading-tight">
              {klient.emri} {klient.mbiemri}
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              {klient.numri_personal}
            </span>
          </div>
        </div>
        <Badge value={klient.statusi} />
      </div>

      {/* Contact */}
      <div className="space-y-1.5 mb-5">
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-medium truncate">{klient.email}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="text-xs font-medium">{klient.telefoni}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 border-t border-slate-50 pt-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Lloji</p>
          <Badge value={klient.lloji_klientit} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Portal</p>
          <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${
            !hasPortal ? 'text-slate-400' : portalActive ? 'text-violet-700' : 'text-slate-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${!hasPortal ? 'bg-slate-300' : portalActive ? 'bg-violet-500' : 'bg-slate-300'}`} />
            {!hasPortal ? 'Pa llogari' : portalActive ? 'Aktiv' : 'Joaktiv'}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Regjistruar</p>
          <p className="text-[12px] font-black text-slate-800">{fmt(klient.data_regjistrimit)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(klient); }}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-violet-700 bg-slate-50 hover:bg-violet-50 rounded-xl py-2 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Ndrysho
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(klient); }}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl py-2 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Fshi
        </button>
      </div>
    </div>
  );
}
