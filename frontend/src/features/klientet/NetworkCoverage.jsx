import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios.js';

// ─── Status visual config ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
  potencial_5g: {
    color:  'text-emerald-600',
    bg:     'bg-emerald-50 border-emerald-200',
    dot:    'bg-emerald-500',
    ring:   'ring-emerald-200',
    label:  'Potencial i lartë për 5G',
    icon:   '📶',
  },
  mbulueshmeri_4g: {
    color:  'text-amber-600',
    bg:     'bg-amber-50 border-amber-200',
    dot:    'bg-amber-500',
    ring:   'ring-amber-200',
    label:  'Mbulueshmëri e mirë 4G+',
    icon:   '📡',
  },
  i_dobet: {
    color:  'text-red-600',
    bg:     'bg-red-50 border-red-200',
    dot:    'bg-red-500',
    ring:   'ring-red-200',
    label:  'Sinjal i dobët / Nevojitet përforcues',
    icon:   '⚠️',
  },
  pa_koordinata: {
    color:  'text-slate-500',
    bg:     'bg-slate-50 border-slate-200',
    dot:    'bg-slate-400',
    ring:   'ring-slate-200',
    label:  'Nuk ka koordinata GPS',
    icon:   '📍',
  },
  pa_api: {
    color:  'text-slate-500',
    bg:     'bg-slate-50 border-slate-200',
    dot:    'bg-slate-400',
    ring:   'ring-slate-200',
    label:  'API key i OpenCelliD mungon',
    icon:   '🔑',
  },
  gabim: {
    color:  'text-slate-500',
    bg:     'bg-slate-50 border-slate-200',
    dot:    'bg-slate-400',
    ring:   'ring-slate-200',
    label:  'Gabim gjatë kontrollimit',
    icon:   '❌',
  },
};

// ─── Signal Bars SVG ──────────────────────────────────────────────────────────
function SignalBars({ level = 0, color = '#94a3b8' }) {
  // level: 0=none, 1=weak, 2=medium, 3=strong
  const bars = [
    { h: 6,  active: level >= 1 },
    { h: 10, active: level >= 2 },
    { h: 14, active: level >= 3 },
    { h: 18, active: level >= 3 },
  ];
  return (
    <svg viewBox="0 0 24 20" className="w-8 h-7">
      {bars.map((b, i) => (
        <rect
          key={i}
          x={i * 6 + 1} y={20 - b.h} width={4} height={b.h} rx={1}
          fill={b.active ? color : '#e2e8f0'}
        />
      ))}
    </svg>
  );
}

function signalLevel(statusi) {
  if (statusi === 'potencial_5g')     return 3;
  if (statusi === 'mbulueshmeri_4g')  return 2;
  if (statusi === 'i_dobet')          return 1;
  return 0;
}

function signalColor(statusi) {
  if (statusi === 'potencial_5g')    return '#10b981';
  if (statusi === 'mbulueshmeri_4g') return '#f59e0b';
  if (statusi === 'i_dobet')         return '#ef4444';
  return '#94a3b8';
}

// ─── Coordinate Form ─────────────────────────────────────────────────────────
function CoordinateForm({ hashId, current, onSaved }) {
  const qc = useQueryClient();
  const [lat, setLat] = useState(current?.latitude  ?? '');
  const [lon, setLon] = useState(current?.longitude ?? '');
  const [err, setErr] = useState('');

  const mut = useMutation({
    mutationFn: (data) => api.patch(`/klientet/${hashId}/koordinata`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['network-coverage', hashId] });
      onSaved?.();
    },
    onError: (e) => setErr(e.response?.data?.message ?? 'Gabim gjatë ruajtjes.'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    const latitude  = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (isNaN(latitude) || isNaN(longitude)) { setErr('Koordinatat janë të pavlefshme.'); return; }
    mut.mutate({ latitude, longitude });
  }

  // Try to get browser location
  function useMyLocation() {
    if (!navigator.geolocation) { setErr('Gjeolokacioni nuk mbështetet.'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude.toFixed(6)); setLon(pos.coords.longitude.toFixed(6)); },
      ()    => setErr('Nuk u arrit të merret lokacioni.')
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Gjerësia (Lat)</label>
          <input
            type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)}
            placeholder="p.sh. 42.6629"
            className="w-full px-3 py-2 text-[13px] border border-[#f0edf8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7c5cdb]/30"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Gjatësia (Lon)</label>
          <input
            type="number" step="any" value={lon} onChange={(e) => setLon(e.target.value)}
            placeholder="p.sh. 21.1655"
            className="w-full px-3 py-2 text-[13px] border border-[#f0edf8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7c5cdb]/30"
          />
        </div>
      </div>
      {err && <p className="text-[11px] text-red-500">{err}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={useMyLocation}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-slate-600 bg-[#f8f7fc] rounded-xl hover:bg-[#ede9f7] transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Lokacioni im
        </button>
        <button type="submit" disabled={mut.isPending}
          className="flex-1 py-1.5 text-[12px] font-bold text-white bg-[#7c5cdb] rounded-xl hover:bg-[#6d4fcb] transition-colors disabled:opacity-60">
          {mut.isPending ? 'Duke ruajtur…' : 'Ruaj & kontrollo'}
        </button>
      </div>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function NetworkCoverage({ hashId, klient }) {
  const [editCoords, setEditCoords] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey:  ['network-coverage', hashId],
    queryFn:   () => api.get(`/klientet/${hashId}/network-coverage`).then((r) => r.data),
    staleTime: 1000 * 60 * 30,
  });

  const cfg   = STATUS_CONFIG[data?.statusi] ?? STATUS_CONFIG.gabim;
  const level = signalLevel(data?.statusi);
  const color = signalColor(data?.statusi);

  return (
    <div className={`rounded-2xl border p-4 ${cfg.bg}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl ${cfg.bg} border ${cfg.ring ? `ring-2 ${cfg.ring}` : ''} flex items-center justify-center`}>
            <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${data?.statusi === 'potencial_5g' ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mbulueshmëria e Rrjetit</p>
            <p className={`text-[13px] font-black ${cfg.color}`}>{isLoading ? 'Duke kontrolluar…' : (data?.etiketa ?? cfg.label)}</p>
          </div>
        </div>
        <SignalBars level={level} color={color} />
      </div>

      {/* Details */}
      {data && data.distanca_m != null && (
        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-white/60">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Distanca</p>
            <p className={`text-[14px] font-black ${cfg.color}`}>{data.distanca_m}m</p>
          </div>
          {data.kulla && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Kulla</p>
              <p className="text-[13px] font-bold text-slate-700">{data.kulla.radio ?? 'LTE'} · MNC {data.kulla.mnc ?? '—'}</p>
            </div>
          )}
          <div className="ml-auto">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Statusi 5G</p>
            <p className={`text-[12px] font-black ${cfg.color}`}>
              {data.statusi === 'potencial_5g' ? '✓ Gati' : data.statusi === 'mbulueshmeri_4g' ? '~ I arritshëm' : '✕ Jo'}
            </p>
          </div>
        </div>
      )}

      {/* Coordinate controls */}
      <div className="mt-3 pt-2 border-t border-white/60">
        {klient?.latitude && klient?.longitude && !editCoords ? (
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-400 font-mono">
              {Number(klient.latitude).toFixed(4)}°N, {Number(klient.longitude).toFixed(4)}°E
            </p>
            <div className="flex gap-2">
              <button onClick={() => refetch()} className="text-[11px] font-bold text-[#7c5cdb] hover:underline">Rifresko</button>
              <button onClick={() => setEditCoords(true)} className="text-[11px] font-bold text-slate-400 hover:text-slate-700">Ndrysho GPS</button>
            </div>
          </div>
        ) : (
          <>
            {!editCoords ? (
              <button onClick={() => setEditCoords(true)}
                className="w-full py-1.5 text-[12px] font-bold text-[#7c5cdb] border border-[#7c5cdb]/30 rounded-xl hover:bg-[#ede9f7] transition-colors">
                + Shto koordinatat GPS
              </button>
            ) : (
              <CoordinateForm
                hashId={hashId}
                current={klient}
                onSaved={() => setEditCoords(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
