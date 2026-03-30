import Badge from '../../components/ui/Badge.jsx';

const LLOJI_COLORS = {
  prepaid:  'bg-sky-100 text-sky-600',
  postpaid: 'bg-indigo-100 text-indigo-600',
  biznes:   'bg-violet-100 text-violet-600',
};

export default function NumriCard({ numri, onEdit, onDelete }) {
  const kontrate  = numri.kontrate;
  const klient    = kontrate?.klient;
  const iconClass = LLOJI_COLORS[numri.lloji] ?? 'bg-slate-100 text-slate-600';

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {/* Phone icon circle */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[16px] font-black text-slate-900 tracking-wide">{numri.numri_telefonit}</h3>
            <Badge value={numri.lloji} />
          </div>
        </div>
        <Badge value={numri.statusi} />
      </div>

      {/* Klienti / Kontrata */}
      {klient ? (
        <div className="flex items-center gap-2 mb-4 bg-slate-50 rounded-2xl px-4 py-3">
          <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-black text-[11px] flex-shrink-0">
            {klient.emri?.charAt(0)}{klient.mbiemri?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-800 truncate">{klient.emri} {klient.mbiemri}</p>
            <p className="text-[10px] text-slate-400 font-semibold">{kontrate?.numri_kontrates}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-4 bg-slate-50 rounded-2xl px-4 py-3">
          <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <span className="text-xs text-slate-400 font-semibold italic">Pa kontratë — numër i lirë</span>
        </div>
      )}

      {/* Data aktivizimit */}
      <div className="border-t border-slate-50 pt-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Data Aktivizimit</p>
        <p className="text-[13px] font-black text-slate-800">{fmt(numri.data_aktivizimit)}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(numri)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl py-2 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Ndrysho
        </button>
        <button
          onClick={() => onDelete(numri)}
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
