import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios.js';

// Kosovo center (Prishtinë)
const PRISTINA = [42.6629, 21.1655];

// ─── Dot icon ─────────────────────────────────────────────────────────────────
function makeDot(is5G, isMaint) {
  const color = is5G ? '#2563eb' : '#dc2626';
  const size  = is5G ? 13 : 10;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 1px 5px rgba(0,0,0,0.4);
      opacity:${isMaint ? 0.45 : 1};
    "></div>`,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -size],
  });
}

// ─── Auto-fit to Kosovo bounds on first load ──────────────────────────────────
function MapFit({ antennas }) {
  const map = useMap();
  useEffect(() => {
    if (antennas.length > 0) {
      const bounds = L.latLngBounds(antennas.map(a => [a.lat, a.lon]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [antennas.length]); // eslint-disable-line
  return null;
}

const STATUS_LABEL = { active: '✓ Aktive', maintenance: '⚠ Mirëmbajtje', offline: '✕ Offline' };
const STATUS_COLOR = { active: 'text-emerald-600', maintenance: 'text-amber-600', offline: 'text-red-600' };

// ─── Main component ───────────────────────────────────────────────────────────
export default function AntennaMap({ height = 460 }) {
  const { data: antennas = [], isLoading } = useQuery({
    queryKey:  ['antennas'],
    queryFn:   () => api.get('/antennas').then(r => r.data),
    staleTime: 1000 * 60 * 10,
  });

  const nr5G   = antennas.filter(a => a.tipi === '5G').length;
  const nrLTE  = antennas.filter(a => a.tipi === 'LTE').length;
  const active = antennas.filter(a => a.statusi === 'active').length;
  const maint  = antennas.filter(a => a.statusi === 'maintenance').length;

  return (
    <div className="flex flex-col h-full">

      {/* ── Stats bar ── */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[#f0edf8] flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span className="text-[11px] font-bold text-slate-700">{nr5G} × 5G NR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-600" />
          <span className="text-[11px] font-bold text-slate-700">{nrLTE} × LTE</span>
        </div>
        <div className="w-px h-3 bg-slate-200" />
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-slate-500">{active} aktive</span>
        </div>
        {maint > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[11px] text-amber-600 font-semibold">{maint} mirëmbajtje</span>
          </div>
        )}
        <span className="ml-auto text-[10px] font-bold text-slate-400 bg-[#f0edf8] px-2 py-0.5 rounded-full">
          Kosovo · {antennas.length} pika
        </span>
      </div>

      {/* ── Map ── */}
      <div style={{ height, flex: 1, minHeight: 0, position: 'relative', zIndex: 0 }}>
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-[#f8f7fc]">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] text-slate-400">Duke ngarkuar antenat…</span>
            </div>
          </div>
        ) : (
          <MapContainer
            center={PRISTINA}
            zoom={8}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={true}
            zoomControl={true}
          >
            {/* CartoDB B&W tiles */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={19}
            />

            <MapFit antennas={antennas} />

            {antennas.map(a => {
              const is5G   = a.tipi === '5G';
              const isMaint = a.statusi === 'maintenance';
              return (
                <Marker
                  key={a.antenna_id}
                  position={[a.lat, a.lon]}
                  icon={makeDot(is5G, isMaint)}
                >
                  <Popup maxWidth={200}>
                    <div className="text-xs space-y-0.5 py-0.5" style={{ minWidth: 170 }}>
                      <p className="font-black text-slate-800 text-[13px] leading-tight mb-1">{a.emri}</p>
                      <p><span className="font-semibold text-slate-500">Tipi:</span>{' '}
                        <span className={`font-bold ${is5G ? 'text-blue-600' : 'text-red-600'}`}>{a.tipi}</span>
                      </p>
                      <p><span className="font-semibold text-slate-500">Qyteti:</span> {a.qyteti}</p>
                      <p><span className="font-semibold text-slate-500">Rrezja:</span> {(a.coverage_radius_m / 1000).toFixed(1)} km</p>
                      <p className={`font-bold mt-1 ${STATUS_COLOR[a.statusi] ?? 'text-slate-500'}`}>
                        {STATUS_LABEL[a.statusi] ?? a.statusi}
                      </p>
                      {a.shenimet && (
                        <p className="text-amber-600 text-[10px] mt-1 leading-snug">{a.shenimet}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Coverage circles — separate pass so circles render under markers */}
            {antennas.map(a => {
              const is5G   = a.tipi === '5G';
              const isMaint = a.statusi === 'maintenance';
              const color  = is5G ? '#2563eb' : '#dc2626';
              return (
                <Circle
                  key={`c-${a.antenna_id}`}
                  center={[a.lat, a.lon]}
                  radius={a.coverage_radius_m}
                  pathOptions={{
                    color,
                    fillColor:    color,
                    fillOpacity:  isMaint ? 0.025 : (is5G ? 0.08 : 0.05),
                    weight:       isMaint ? 0.8 : 1.2,
                    dashArray:    isMaint ? '5 5' : undefined,
                    opacity:      isMaint ? 0.4 : 0.7,
                  }}
                />
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
}