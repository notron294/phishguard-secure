import { useEffect, useState } from "react";
import { Globe2, Radio } from "lucide-react";

// Lat/Lng for hotspot cities — converted to SVG (equirectangular projection 0-360°)
interface Hotspot {
  city: string;
  country: string;
  lat: number;
  lng: number;
  severity: "low" | "med" | "high" | "crit";
  count: number;
}

const HOTSPOTS: Hotspot[] = [
  { city: "New York", country: "US", lat: 40.7, lng: -74.0, severity: "crit", count: 18420 },
  { city: "San Francisco", country: "US", lat: 37.77, lng: -122.42, severity: "high", count: 12110 },
  { city: "São Paulo", country: "BR", lat: -23.55, lng: -46.63, severity: "med", count: 7820 },
  { city: "London", country: "UK", lat: 51.5, lng: -0.12, severity: "crit", count: 16980 },
  { city: "Berlin", country: "DE", lat: 52.52, lng: 13.4, severity: "high", count: 9410 },
  { city: "Lagos", country: "NG", lat: 6.52, lng: 3.37, severity: "crit", count: 14250 },
  { city: "Moscow", country: "RU", lat: 55.75, lng: 37.61, severity: "crit", count: 21330 },
  { city: "Mumbai", country: "IN", lat: 19.07, lng: 72.87, severity: "high", count: 11040 },
  { city: "Singapore", country: "SG", lat: 1.35, lng: 103.81, severity: "med", count: 6210 },
  { city: "Tokyo", country: "JP", lat: 35.68, lng: 139.69, severity: "high", count: 9870 },
  { city: "Sydney", country: "AU", lat: -33.87, lng: 151.21, severity: "low", count: 3120 },
  { city: "Cape Town", country: "ZA", lat: -33.92, lng: 18.42, severity: "med", count: 4980 },
  { city: "Dubai", country: "AE", lat: 25.27, lng: 55.3, severity: "high", count: 8420 },
  { city: "Toronto", country: "CA", lat: 43.65, lng: -79.38, severity: "med", count: 5610 },
  { city: "Mexico City", country: "MX", lat: 19.43, lng: -99.13, severity: "high", count: 8120 },
];

const SEV = {
  low: "var(--success)",
  med: "var(--warning)",
  high: "var(--critical)",
  crit: "var(--critical)",
};

// Simple equirectangular projection: viewBox 0 0 1000 500
function project(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x, y };
}

export function ThreatMap() {
  const [pings, setPings] = useState<{ id: number; idx: number }[]>([]);

  // Spawn random pings to simulate live activity
  useEffect(() => {
    let id = 0;
    const t = setInterval(() => {
      const idx = Math.floor(Math.random() * HOTSPOTS.length);
      const newId = ++id;
      setPings((p) => [...p, { id: newId, idx }]);
      setTimeout(() => {
        setPings((p) => p.filter((x) => x.id !== newId));
      }, 2400);
    }, 700);
    return () => clearInterval(t);
  }, []);

  const total = HOTSPOTS.reduce((a, b) => a + b.count, 0);

  return (
    <div className="glass mb-8 overflow-hidden rounded-2xl border border-border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Globe2 className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Live phishing distribution
          </span>
          <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] text-muted-foreground">
            <Radio className="h-2.5 w-2.5 text-success ticker-pulse" />
            real-time
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
          <span>
            Hotspots <span className="text-foreground">{HOTSPOTS.length}</span>
          </span>
          <span>
            Events 24h <span className="text-foreground">{total.toLocaleString()}</span>
          </span>
        </div>
      </div>

      <div className="relative aspect-[2/1] w-full">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(1 0 0 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <svg viewBox="0 0 1000 500" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ocean background */}
          <rect x="0" y="0" width="1000" height="500" fill="#031026" />

          {/* More detailed continent silhouettes — Midnight theme */}
          <g fill="#1b1d20" stroke="rgba(220,225,230,0.06)" strokeWidth="0.6">
            <path d="M120 115 C160 95 210 90 260 100 C300 110 320 140 325 170 C330 200 300 230 270 245 C235 260 195 245 165 220 C140 195 125 160 120 115 Z" />
            <path d="M260 275 C290 270 310 295 320 330 C330 370 315 400 295 410 C275 420 260 405 255 380 C250 350 258 310 260 275 Z" />
            <path d="M450 105 C485 95 520 100 550 115 C570 130 565 155 550 165 C530 175 505 170 490 160 C480 145 468 120 450 105 Z" />
            <path d="M480 190 C520 185 545 210 560 245 C575 285 560 325 535 345 C510 365 490 360 480 335 C472 310 468 265 480 190 Z" />
            <path d="M570 105 C640 95 720 105 780 125 C820 145 830 185 815 215 C790 245 730 255 690 250 C650 245 610 230 585 205 C570 170 570 125 570 105 Z" />
            <path d="M760 325 C800 320 830 335 850 355 C860 375 845 390 825 395 C800 402 775 390 760 370 C755 350 755 335 760 325 Z" />
          </g>

          {/* subtle lat/lng guides */}
          <g stroke="rgba(255,255,255,0.02)" strokeWidth="0.4">
            <line x1="0" y1="250" x2="1000" y2="250" />
            <line x1="500" y1="0" x2="500" y2="500" />
          </g>

          {/* Detection zones (transparent circles with glowing stroke + pulse) */}
          {HOTSPOTS.map((h, i) => {
            const { x, y } = project(h.lat, h.lng);
            const color = SEV[h.severity];
            const baseR = h.severity === "crit" ? 56 : h.severity === "high" ? 44 : h.severity === "med" ? 30 : 18;
            return (
              <g key={i}>
                {/* translucent detection fill + glowing stroke */}
                <circle cx={x} cy={y} r={baseR} fill={color} fillOpacity={0.3} stroke={color} strokeWidth={2.8} style={{ filter: "url(#glow)" }} />

                {/* slow pulsing ring */}
                <circle cx={x} cy={y} r={baseR} fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.9}>
                  <animate attributeName="r" values={`${baseR};${Math.round(baseR * 1.25)};${baseR}`} dur="2.6s" repeatCount="indefinite" begin={`${i * 0.18}s`} />
                  <animate attributeName="opacity" values="0.9;0.45;0.9" dur="2.6s" repeatCount="indefinite" begin={`${i * 0.18}s`} />
                </circle>

                {/* solid core */}
                <circle cx={x} cy={y} r={Math.max(2, Math.round(baseR * 0.16))} fill={color}>
                  <title>
                    {h.city}, {h.country} — {h.count.toLocaleString()} events
                  </title>
                </circle>
              </g>
            );
          })}

          {/* Random "ping" attacks fired at hotspots (smaller ripples) */}
          {pings.map((p) => {
            const h = HOTSPOTS[p.idx];
            const { x, y } = project(h.lat, h.lng);
            const color = SEV[h.severity];
            const maxR = h.severity === "crit" ? 74 : h.severity === "high" ? 60 : h.severity === "med" ? 42 : 28;
            return (
              <g key={p.id}>
                <circle cx={x} cy={y} r="2" fill="none" stroke={color} strokeWidth="1.6" strokeOpacity="0.9">
                  <animate attributeName="r" from="2" to={String(maxR)} dur="1.9s" fill="freeze" />
                  <animate attributeName="opacity" from="0.9" to="0" dur="1.9s" fill="freeze" />
                </circle>
                <circle cx={x} cy={y} r="2" fill={color}>
                  <animate attributeName="opacity" from="1" to="0" dur="1.9s" fill="freeze" />
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background/70 px-3 py-1.5 text-[10px] backdrop-blur">
          {(
            [
              ["Low", "var(--success)"],
              ["Medium", "var(--warning)"],
              ["High", "var(--critical)"],
              ["Critical", "var(--critical)"],
            ] as const
          ).map(([label, c]) => (
            <span key={label} className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: c, boxShadow: `0 0 8px ${c}` }}
              />
              {label}
            </span>
          ))}
        </div>

        {/* Top-right live counter */}
        <div className="absolute right-3 top-3 rounded-lg border border-border bg-background/70 px-3 py-1.5 font-mono text-[10px] text-muted-foreground backdrop-blur">
          <span className="text-success">●</span> streaming · {pings.length} active
        </div>
      </div>
    </div>
  );
}
