import Badge from '../../components/ui/Badge.jsx';

function InfoRow({ icon, text }) {
  return (
    <div className="flex items-center gap-2 text-slate-500">
      {icon}
      <span className="text-xs font-medium truncate">{text}</span>
    </div>
  );
}

export default function KontratCard({ kontrate, onEdit, onDelete }) {
  const klient = kontrate.klient;
  const paket  = kontrate.paket;

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const initials = klient
    ? `${klient.emri?.charAt(0) ?? ''}${klient.mbiemri?.charAt(0) ?? ''}`.toUpperCase()
    : '?';

  return (
    <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-black text-sm flex-shrink-0">
            {initials}
          </div>
          <div>
            <h3 className="text-[15px] font-black text-slate-900 leading-tight">
              {klient ? `${klient.emri} ${klient.mbiemri}` : '—'}
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              {kontrate.numri_kontrates}
            </span>
          </div>
        </div>
        <Badge value={kontrate.statusi} />
      </div>

      {/* Paketa info */}
      {paket && (
        <div className="flex items-center gap-2 mb-4 bg-slate-50 rounded-2xl px-4 py-3">
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-slate-800 truncate">{paket.emri_paketes}</p>
            <p className="text-[10px] text-slate-400 font-semibold">
              {Number(paket.cmimi_mujor).toFixed(2)}€/muaj · <Badge value={paket.lloji_sherbimit} />
            </p>
          </div>
        </div>
      )}

      {/* Contact */}
      {klient && (
        <div className="space-y-1.5 mb-4">
          <InfoRow
            icon={<svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            text={klient.email}
          />
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3 border-t border-slate-50 pt-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Fillimi</p>
          <p className="text-[12px] font-black text-slate-800">{fmt(kontrate.data_fillimit)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mbarimi</p>
          <p className="text-[12px] font-black text-slate-800">{fmt(kontrate.data_mbarimit)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(kontrate)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl py-2 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Ndrysho
        </button>
        <button
          onClick={() => onDelete(kontrate)}
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
