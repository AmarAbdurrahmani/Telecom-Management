import Badge from '../../components/ui/Badge.jsx';

export default function SherbimCard({ sherbim, onEdit, onDelete, onSync }) {
  return (
    <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-black text-slate-900 leading-tight">{sherbim.emri_sherbimit}</h3>
            <Badge value={sherbim.aktiv ? 'aktiv' : 'joaktiv'} />
          </div>
        </div>

        {/* Kontratat count badge */}
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kontrata</p>
          <p className="text-lg font-black text-slate-900">{sherbim.kontratat_count ?? 0}</p>
        </div>
      </div>

      {/* Pershkrimi */}
      {sherbim.pershkrimi && (
        <p className="text-xs text-slate-500 mb-4 leading-relaxed line-clamp-2">{sherbim.pershkrimi}</p>
      )}

      {/* Cmimi */}
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-2xl font-black text-slate-900">
          {Number(sherbim.cmimi_mujor).toFixed(2)}
        </span>
        <span className="text-sm font-bold text-slate-400">€ / muaj</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Sync button */}
        <button
          onClick={() => onSync(sherbim)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl py-2 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Cakto
        </button>
        <button
          onClick={() => onEdit(sherbim)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl py-2 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Ndrysho
        </button>
        <button
          onClick={() => onDelete(sherbim)}
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
