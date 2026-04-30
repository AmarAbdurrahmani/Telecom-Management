import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios.js';

// ─── Fix Leaflet's broken default icon path under Vite ────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Custom tower icon ────────────────────────────────────────────────────────
function makeTowerIcon(radio) {
  const isNR  = radio === 'NR';   // 5G
  const color = isNR ? '#7c5cdb' : '#3b82f6';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
        </filter>
      </defs>
      <!-- Pin body -->
      <path d="M16 0 C7.2 0 0 7.2 0 16 C0 24.8 16 42 16 42 C16 42 32 24.8 32 16 C32 7.2 24.8 0 16 0Z"
            fill="${color}" filter="url(#shadow)"/>
      <!-- Tower icon inside -->
      <g transform="translate(8, 6)" fill="white" opacity="0.95">
        <!-- Antenna mast -->
        <rect x="9" y="3" width="2" height="11" rx="1"/>
        <!-- Crossbars -->
        <rect x="5" y="5"  width="10" height="1.5" rx="0.75"/>
        <rect x="6" y="8"  width="8"  height="1.5" rx="0.75"/>
        <rect x="7" y="11" width="6"  height="1.5" rx="0.75"/>
        <!-- Base legs -->
        <line x1="10" y1="14" x2="4"  y2="18" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="10" y1="14" x2="16" y2="18" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <rect x="3" y="17" width="14" height="1.5" rx="0.75"/>
      </g>
      ${isNR ? `<circle cx="24" cy="6" r="5" fill="#10b981"/>
               <text x="24" y="9.5" text-anchor="middle" font-size="6" font-weight="bold" fill="white">5G</text>` : ''}
    </svg>
  `;

  return L.divIcon({
    className: '',
    html: svg,
    iconSize:   [32, 42],
    iconAnchor: [16, 42],
    popupAnchor:[0, -40],
  });
}

// ─── Centre marker icon (purple pin) ─────────────────────────────────────────
const CENTER_ICON = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32">
    <path d="M12 0C5.4 0 0 5.4 0 12 0 18.6 12 32 12 32S24 18.6 24 12C24 5.4 18.6 0 12 0Z"
          fill="#7c5cdb" opacity="0.9"/>
    <circle cx="12" cy="12" r="4" fill="white"/>
  </svg>`,
  iconSize:   [24, 32],
  iconAnchor: [12, 32],
  popupAnchor:[0, -32],
});

// ─── Haversine distance (km) ──────────────────────────────────────────────────
function distKm(lat1, lon1, lat2, lon2) {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a    = Math.sin(dLat / 2) ** 2
             + Math.cos((lat1 * Math.PI) / 180)
             * Math.cos((lat2 * Math.PI) / 180)
             * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

// ─── Recenter helper (reacts to prop changes) ─────────────────────────────────
function MapCentre({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
}

// ─── Radio label ──────────────────────────────────────────────────────────────
const RADIO_LABELS = { LTE: '4G LTE', NR: '5G NR', UMTS: '3G UMTS', GSM: '2G GSM' };

// ─── Main component ───────────────────────────────────────────────────────────
export default function NetworkMap({
  center      = [41.3275, 19.8189],
  zoom        = 13,
  radiusM     = 2000,
  locationLabel = '41.33°N, 19.82°E — Tiranë, AL',
  height      = 280,
}) {
  const [lat, lon] = center;

  const { data, isLoading, isError } = useQuery({
    queryKey:  ['network-towers', lat, lon, radiusM],
    queryFn:   () =>
      api.get('/network/towers', { params: { lat, lon, radius: radiusM } }).then((r) => r.data),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  const isDemo  = data?.demo ?? false;
  const towers  = data?.cells ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Demo / error banner */}
      {(isDemo || isError) && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border-b border-amber-100">
          <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[11px] font-semibold text-amber-700">
            {isError
              ? 'Gabim në lidhje — po shfaqet mënyra Demo'
              : 'Harta në modin Demo — Shërbimi Live kërkon API Key aktiv'}
          </span>
        </div>
      )}

      {/* Map */}
      <div style={{ height, position: 'relative', zIndex: 0 }}>
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-[#f8f7fc]">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-[#7c5cdb] border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] text-slate-400 font-medium">Duke ngarkuar hartën…</span>
            </div>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={true}
            zoomControl={true}
          >
            <MapCentre center={center} zoom={zoom} />

            {/* OSM tile layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Centre / HQ marker */}
            <Marker position={center} icon={CENTER_ICON}>
              <Popup>
                <div className="text-xs font-semibold">
                  <p className="font-black text-[#7c5cdb] mb-0.5">📍 Qendra e monitorimit</p>
                  <p className="text-slate-500">{locationLabel}</p>
                </div>
              </Popup>
            </Marker>

            {/* Coverage radius circle */}
            <Circle
              center={center}
              radius={radiusM}
              pathOptions={{ color: '#7c5cdb', fillColor: '#7c5cdb', fillOpacity: 0.04, weight: 1.5, dashArray: '6 4' }}
            />

            {/* Tower markers */}
            {towers.map((tower, i) => {
              const dist = distKm(lat, lon, tower.lat, tower.lon);
              const isNR = tower.radio === 'NR';
              return (
                <Marker
                  key={i}
                  position={[tower.lat, tower.lon]}
                  icon={makeTowerIcon(tower.radio)}
                >
                  <Popup>
                    <div style={{ minWidth: 160 }} className="text-xs space-y-1">
                      <p className="font-black text-slate-800 text-[13px]">
                        {isNR ? '🟢 Kullë 5G NR' : '🔵 Kullë 4G LTE'}
                      </p>
                      <div className="space-y-0.5 text-slate-600">
                        <p><span className="font-semibold">Teknologjia:</span> {RADIO_LABELS[tower.radio] ?? tower.radio}</p>
                        <p><span className="font-semibold">MCC/MNC:</span> {tower.mcc}/{tower.mnc ?? '—'}</p>
                        <p><span className="font-semibold">Distanca:</span> {dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(2)}km`}</p>
                        {tower.range && (
                          <p><span className="font-semibold">Rreze:</span> {tower.range}m</p>
                        )}
                        {tower.samples && (
                          <p><span className="font-semibold">Kampione:</span> {tower.samples}</p>
                        )}
                        {isDemo && (
                          <p className="text-amber-600 font-semibold mt-1">⚠ Të dhëna demo</p>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-[#f8f7fc] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[11px] text-slate-400 font-medium">{locationLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
            <span className="text-[10px] text-slate-400">4G</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#7c5cdb]" />
            <span className="text-[10px] text-slate-400">5G</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{towers.length} kulla</span>
        </div>
      </div>
    </div>
  );
}
