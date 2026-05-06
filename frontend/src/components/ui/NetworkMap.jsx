import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makeDotIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:13px;height:13px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.4)"></div>`,
    iconSize:   [13, 13],
    iconAnchor: [6, 6],
    popupAnchor:[0, -10],
  });
}

const ICON_5G = makeDotIcon('#7c5cdb');
const ICON_4G = makeDotIcon('#f97316');

// tier 1 = visible at any zoom
// tier 2 = visible at zoom >= 9
// tier 3 = visible at zoom >= 11
const MARKERS = [
  // ── Prishtinë ──────────────────────────────────────────────────────────────
  { lat: 42.6629, lon: 21.1655, type: '5G', city: 'Prishtinë',  name: 'Qendra',          tier: 1 },
  { lat: 42.6511, lon: 21.1808, type: '5G', city: 'Prishtinë',  name: 'Ulpiana',          tier: 2 },
  { lat: 42.6705, lon: 21.1820, type: '5G', city: 'Prishtinë',  name: 'Dardania',         tier: 2 },
  { lat: 42.6760, lon: 21.1590, type: '5G', city: 'Prishtinë',  name: 'Bregu i Diellit',  tier: 3 },
  { lat: 42.6830, lon: 21.1700, type: '5G', city: 'Prishtinë',  name: 'Sunny Hill',       tier: 3 },
  { lat: 42.6580, lon: 21.1480, type: '4G', city: 'Prishtinë',  name: 'Dragodan',         tier: 3 },
  { lat: 42.6450, lon: 21.1870, type: '4G', city: 'Prishtinë',  name: 'Lakrishte',        tier: 3 },
  { lat: 42.6620, lon: 21.2000, type: '4G', city: 'Prishtinë',  name: 'Kodra e Trimave',  tier: 3 },
  { lat: 42.6480, lon: 21.1500, type: '4G', city: 'Prishtinë',  name: 'Taukbashçe',       tier: 3 },

  // ── Fushë Kosovë ───────────────────────────────────────────────────────────
  { lat: 42.6625, lon: 21.0947, type: '5G', city: 'Fushë Kosovë', name: 'Qendra',         tier: 2 },
  { lat: 42.6500, lon: 21.0800, type: '4G', city: 'Fushë Kosovë', name: 'Jugore',         tier: 3 },

  // ── Lipjan ─────────────────────────────────────────────────────────────────
  { lat: 42.5219, lon: 21.1219, type: '5G', city: 'Lipjan',     name: 'Qendra',           tier: 2 },
  { lat: 42.5100, lon: 21.1300, type: '4G', city: 'Lipjan',     name: 'Jugore',           tier: 3 },

  // ── Drenas ─────────────────────────────────────────────────────────────────
  { lat: 42.6264, lon: 20.8769, type: '4G', city: 'Drenas',     name: 'Qendra',           tier: 2 },

  // ── Mitrovicë ──────────────────────────────────────────────────────────────
  { lat: 42.8914, lon: 20.8660, type: '5G', city: 'Mitrovicë',  name: 'Qendra',           tier: 1 },
  { lat: 42.8800, lon: 20.8750, type: '4G', city: 'Mitrovicë',  name: 'Jugore',           tier: 2 },
  { lat: 42.9020, lon: 20.8550, type: '4G', city: 'Mitrovicë',  name: 'Veriore',          tier: 2 },
  { lat: 42.9200, lon: 20.8700, type: '4G', city: 'Mitrovicë',  name: 'Periferia',        tier: 3 },

  // ── Vushtrri ───────────────────────────────────────────────────────────────
  { lat: 42.8233, lon: 20.9672, type: '4G', city: 'Vushtrri',   name: 'Qendra',           tier: 2 },
  { lat: 42.8100, lon: 20.9500, type: '4G', city: 'Vushtrri',   name: 'Industria',        tier: 3 },

  // ── Skenderaj ──────────────────────────────────────────────────────────────
  { lat: 42.7450, lon: 20.7875, type: '4G', city: 'Skenderaj',  name: 'Qendra',           tier: 2 },

  // ── Podujevë ───────────────────────────────────────────────────────────────
  { lat: 42.9111, lon: 21.1897, type: '4G', city: 'Podujevë',   name: 'Qendra',           tier: 2 },

  // ── Istog ──────────────────────────────────────────────────────────────────
  { lat: 42.7811, lon: 20.4872, type: '4G', city: 'Istog',      name: 'Qendra',           tier: 2 },

  // ── Pejë ───────────────────────────────────────────────────────────────────
  { lat: 42.6597, lon: 20.2889, type: '5G', city: 'Pejë',       name: 'Qendra',           tier: 1 },
  { lat: 42.6500, lon: 20.3000, type: '4G', city: 'Pejë',       name: 'Jugore',           tier: 2 },
  { lat: 42.6700, lon: 20.2800, type: '4G', city: 'Pejë',       name: 'Veriore',          tier: 2 },
  { lat: 42.6650, lon: 20.3200, type: '5G', city: 'Pejë',       name: 'Lindje',           tier: 3 },

  // ── Klinë ──────────────────────────────────────────────────────────────────
  { lat: 42.6228, lon: 20.5769, type: '4G', city: 'Klinë',      name: 'Qendra',           tier: 2 },

  // ── Gjakovë ────────────────────────────────────────────────────────────────
  { lat: 42.3800, lon: 20.4300, type: '5G', city: 'Gjakovë',    name: 'Qendra',           tier: 1 },
  { lat: 42.3700, lon: 20.4400, type: '4G', city: 'Gjakovë',    name: 'Jugore',           tier: 2 },
  { lat: 42.3900, lon: 20.4200, type: '4G', city: 'Gjakovë',    name: 'Veriore',          tier: 2 },
  { lat: 42.3650, lon: 20.4150, type: '4G', city: 'Gjakovë',    name: 'Perëndimore',      tier: 3 },

  // ── Rahovec ────────────────────────────────────────────────────────────────
  { lat: 42.3979, lon: 20.6543, type: '4G', city: 'Rahovec',    name: 'Qendra',           tier: 2 },

  // ── Malishevë ──────────────────────────────────────────────────────────────
  { lat: 42.4828, lon: 20.7447, type: '4G', city: 'Malishevë',  name: 'Qendra',           tier: 2 },

  // ── Suharekë ───────────────────────────────────────────────────────────────
  { lat: 42.3589, lon: 20.8255, type: '4G', city: 'Suharekë',   name: 'Qendra',           tier: 2 },

  // ── Prizren ────────────────────────────────────────────────────────────────
  { lat: 42.2139, lon: 20.7397, type: '5G', city: 'Prizren',    name: 'Qendra',           tier: 1 },
  { lat: 42.2050, lon: 20.7500, type: '4G', city: 'Prizren',    name: 'Jugore',           tier: 2 },
  { lat: 42.2250, lon: 20.7300, type: '4G', city: 'Prizren',    name: 'Veriore',          tier: 2 },
  { lat: 42.2300, lon: 20.7600, type: '5G', city: 'Prizren',    name: 'Lindje',           tier: 3 },

  // ── Gjilan ─────────────────────────────────────────────────────────────────
  { lat: 42.4633, lon: 21.4692, type: '5G', city: 'Gjilan',     name: 'Qendra',           tier: 1 },
  { lat: 42.4500, lon: 21.4800, type: '4G', city: 'Gjilan',     name: 'Jugore',           tier: 2 },
  { lat: 42.4750, lon: 21.4600, type: '4G', city: 'Gjilan',     name: 'Veriore',          tier: 2 },
  { lat: 42.4700, lon: 21.4950, type: '5G', city: 'Gjilan',     name: 'Lindje',           tier: 3 },

  // ── Kamenicë ───────────────────────────────────────────────────────────────
  { lat: 42.5786, lon: 21.5797, type: '4G', city: 'Kamenicë',   name: 'Qendra',           tier: 2 },

  // ── Viti ───────────────────────────────────────────────────────────────────
  { lat: 42.3225, lon: 21.3578, type: '4G', city: 'Viti',       name: 'Qendra',           tier: 2 },

  // ── Ferizaj ────────────────────────────────────────────────────────────────
  { lat: 42.3702, lon: 21.1553, type: '5G', city: 'Ferizaj',    name: 'Qendra',           tier: 1 },
  { lat: 42.3600, lon: 21.1650, type: '4G', city: 'Ferizaj',    name: 'Jugore',           tier: 2 },
  { lat: 42.3800, lon: 21.1450, type: '4G', city: 'Ferizaj',    name: 'Veriore',          tier: 2 },
  { lat: 42.3900, lon: 21.1600, type: '5G', city: 'Ferizaj',    name: 'Industria',        tier: 3 },

  // ── Shtërpcë ───────────────────────────────────────────────────────────────
  { lat: 42.2389, lon: 21.0319, type: '4G', city: 'Shtërpcë',   name: 'Qendra',           tier: 2 },

  // ── Korridori / rrugë nacionale ────────────────────────────────────────────
  { lat: 42.7500, lon: 21.0200, type: '4G', city: 'Autostrada A1', name: 'Km 60',         tier: 2 },
  { lat: 42.5800, lon: 21.0500, type: '4G', city: 'Autostrada A1', name: 'Km 45',         tier: 2 },
  { lat: 42.4500, lon: 21.0800, type: '4G', city: 'Autostrada A1', name: 'Km 30',         tier: 2 },
  { lat: 42.5500, lon: 20.9500, type: '4G', city: 'Rruga N9',      name: 'Segmenti',      tier: 3 },
  { lat: 42.4200, lon: 20.9500, type: '4G', city: 'Rruga N25',     name: 'Segmenti',      tier: 3 },
  { lat: 42.5300, lon: 21.3200, type: '4G', city: 'Rruga N52',     name: 'Segmenti',      tier: 3 },
  { lat: 42.7000, lon: 20.5500, type: '4G', city: 'Rruga N9',      name: 'Pejë–Klinë',   tier: 3 },
];

function ZoomWatcher({ onZoom }) {
  useMapEvents({ zoomend: (e) => onZoom(e.target.getZoom()) });
  return null;
}

export default function NetworkMap({ height = 420 }) {
  const [zoom, setZoom] = useState(11);

  const visible = MARKERS.filter((m) => {
    if (m.tier === 1) return true;
    if (m.tier === 2) return zoom >= 9;
    return zoom >= 11;
  });

  const n5G = visible.filter((m) => m.type === '5G').length;
  const n4G = visible.filter((m) => m.type === '4G').length;

  return (
    <div className="flex flex-col">
      <div style={{ height, position: 'relative', zIndex: 0 }}>
        <MapContainer
          center={[42.6629, 21.1655]}
          zoom={11}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <ZoomWatcher onZoom={setZoom} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {visible.map((m, i) => (
            <Marker
              key={i}
              position={[m.lat, m.lon]}
              icon={m.type === '5G' ? ICON_5G : ICON_4G}
            >
              <Popup>
                <div className="text-xs space-y-0.5">
                  <p className="font-black text-slate-800 text-[13px]">
                    {m.type === '5G' ? '🟣' : '🟠'} {m.name}
                  </p>
                  <p className="text-slate-500">{m.city}</p>
                  <p className="font-bold" style={{ color: m.type === '5G' ? '#7c5cdb' : '#f97316' }}>
                    Rrjeti {m.type}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Footer legend */}
      <div className="px-4 py-2.5 border-t border-[#f8f7fc] flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          Kosovë · {visible.length} stacione
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
            <span className="text-[10px] text-slate-500 font-semibold">4G ({n4G})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#7c5cdb]" />
            <span className="text-[10px] text-slate-500 font-semibold">5G ({n5G})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
