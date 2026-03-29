import Badge from '../../components/ui/Badge.jsx';

const STATUS_COLORS = {
  e_papaguar: 'border-l-amber-400',
  e_paguar:   'border-l-green-400',
  e_vonuar:   'border-l-red-400',
  anulluar:   'border-l-slate-300',
};

export default function FatureCard({ fature, onEdit, onDelete }) {
  const kontrate = fature.kontrate;
  const klient   = kontrate?.klient;
  const paket    = kontrate?.paket;

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const borderColor = STATUS_COLORS[fature.statusi] ?? 'border-l-slate-300';

  return (
    <div className={`bg-white rounded-[24px] p-6 border border-slate-100 border-l-4 ${borderColor} shadow-sm hover:shadow-md transition-shadow group`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            {fature.periudha}
          </p>
          <h3 className="text-[15px] font-black text-slate-900">
            {klient ? `${klient.emri} ${klient.mbiemri}` : '—'}
          </h3>
          {kontrate && (
            <span className="text-[11px] text-slate-400 font-semibold">
              {kontrate.numri_kontrates}
            </span>
          )}
        </div>
        <Badge value={fature.statusi} />
      </div>

      {/* Paketa */}
      {paket && (
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="font-medium truncate">{paket.emri_paketes}</span>
        </div>
      )}

      {/* Shumat */}
      <div className="bg-slate-50 rounded-2xl px-4 py-3 mb-4 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bazë</p>
          <p className="text-[13px] font-black text-slate-700">{Number(fature.shuma_baze).toFixed(2)}€</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shtesë</p>
          <p className="text-[13px] font-black text-slate-700">{Number(fature.shuma_shtese).toFixed(2)}€</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tatim</p>
          <p className="text-[13px] font-black text-slate-700">{Number(fature.tatimi).toFixed(2)}€</p>
        </div>
      </div>

      {/* Totali */}
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-2xl font-black text-slate-900">{Number(fature.totali).toFixed(2)}</span>
        <span className="text-sm font-bold text-slate-400">€ total</span>
      </div>

      {/* Datat */}
      <div className="grid grid-cols-2 gap-3 border-t border-slate-50 pt-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Lëshuar</p>
          <p className="text-[12px] font-black text-slate-800">{fmt(fature.data_leshimit)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Paguar</p>
          <p className="text-[12px] font-black text-slate-800">{fmt(fature.data_pageses)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(fature)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl py-2 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Ndrysho
        </button>
        <button
          onClick={() => onDelete(fature)}
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
