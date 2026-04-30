import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios.js';

// Kosovo center
const KOSOVO_CENTER = [42.6026, 20.9030];

function makeDot(color, isMaintenance = false) {
  const c = color === 'blue' ? '#2563eb' : '#dc2626';
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${c};border:2.5px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.35);${isMaintenance ? 'opacity:0.5' : ''}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

function MapFit({ antennas }) {
  const map = useMap();
  useEffect(() => {
    if (antennas.length > 0) {
      const bounds = L.latLngBounds(antennas.map(a => [a.lat, a.lon]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [antennas.length]); // eslint-disable-line
  return null;
}

export default function AntennaMap({ height = 500 }) {
  const { data: antennas = [], isLoading } = useQuery({
    queryKey: ['antennas'],
    queryFn: () => api.get('/antennas').then(r => r.data),
    staleTime: 1000 * 60 * 10,
  });

  const nr5g   = antennas.filter(a => a.tipi === '5G');
  const lte    = antennas.filter(a => a.tipi === 'LTE');
  const active = antennas.filter(a => a.statusi === 'active').length;

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-[#f0edf8] flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span className="text-[11px] font-bold text-slate-600">{nr5g.length} x 5G NR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-600" />
          <span className="text-[11px] font-bold text-slate-600">{lte.length} x LTE</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium text-slate-500">{active} aktive</span>
        </div>
      </div>

      {/* Map */}
      <div style={{ height, flex: 1, position: 'relative' }}>
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-[#f8f7fc]">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <MapContainer
            center={KOSOVO_CENTER}
            zoom={8}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={19}
            />
            <MapFit antennas={antennas} />
            {antennas.map(a => {
              const is5G   = a.tipi === '5G';
              const isMaint = a.statusi === 'maintenance';
              return (
                <div key={a.antenna_id}>
                  <Circle
                    center={[a.lat, a.lon]}
                    radius={a.coverage_radius_m}
                    pathOptions={{
                      color: is5G ? '#2563eb' : '#dc2626',
                      fillColor: is5G ? '#2563eb' : '#dc2626',
                      fillOpacity: isMaint ? 0.03 : 0.06,
                      weight: isMaint ? 1 : 1.5,
                      dashArray: isMaint ? '4 4' : undefined,
                    }}
                  />
                  <Marker position={[a.lat, a.lon]} icon={makeDot(is5G ? 'blue' : 'red', isMaint)}>
                    <Popup>
                      <div className="text-xs space-y-0.5" style={{ minWidth: 160 }}>
                        <p className="font-black text-slate-800 text-[13px]">{a.emri}</p>
                        <p><span className="font-semibold">Tipi:</span> {a.tipi}</p>
                        <p><span className="font-semibold">Qyteti:</span> {a.qyteti}</p>
                        <p><span className="font-semibold">Rrezja:</span> {a.coverage_radius_m}m</p>
                        <p>
                          <span className={`font-bold ${a.statusi === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {a.statusi === 'active' ? 'Aktive' : 'Mirembajtje'}
                          </span>
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </div>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
