import Badge from '../../components/ui/Badge.jsx';

const SERVICE_ICONS = {
  internet: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  telefoni: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  tv: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  combo: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
};

const COLOR_MAP = {
  internet: 'bg-blue-100 text-blue-600',
  telefoni: 'bg-violet-100 text-violet-600',
  tv:       'bg-amber-100 text-amber-600',
  combo:    'bg-emerald-100 text-emerald-600',
};

function Stat({ label, value, unit }) {
  if (value == null || value === '') return null;
  return (
    <div className="text-center">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-[13px] font-black text-slate-800 mt-0.5">
        {value === 0 ? '∞' : value}
        {value !== 0 && unit && <span className="text-[10px] font-semibold text-slate-500 ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}

export default function PaketCard({ paket, onEdit, onDelete }) {
  const lloji     = paket.lloji_sherbimit ?? 'internet';
  const icon      = SERVICE_ICONS[lloji] ?? SERVICE_ICONS.internet;
  const iconClass = COLOR_MAP[lloji] ?? 'bg-slate-100 text-slate-600';

  const hasStats = paket.shpejtesia_mb != null || paket.data_gb != null ||
                   paket.minuta != null || paket.sms != null;

  return (
    <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-[15px] font-black text-slate-900 leading-tight">{paket.emri_paketes}</h3>
            <Badge value={paket.lloji_sherbimit} />
          </div>
        </div>
        <Badge value={paket.aktive ? 'aktive' : 'joaktive'} />
      </div>

      {/* Pershkrimi */}
      {paket.pershkrimi && (
        <p className="text-xs text-slate-500 mb-4 leading-relaxed line-clamp-2">{paket.pershkrimi}</p>
      )}

      {/* Stats */}
      {hasStats && (
        <div className="grid grid-cols-4 gap-2 bg-slate-50 rounded-2xl px-3 py-3 mb-4">
          <Stat label="Mbps"  value={paket.shpejtesia_mb} />
          <Stat label="GB"    value={paket.data_gb} />
          <Stat label="Min"   value={paket.minuta} />
          <Stat label="SMS"   value={paket.sms} />
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-2xl font-black text-slate-900">
          {Number(paket.cmimi_mujor).toFixed(2)}
        </span>
        <span className="text-sm font-bold text-slate-400">€ / muaj</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(paket)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl py-2 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Ndrysho
        </button>
        <button
          onClick={() => onDelete(paket)}
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
