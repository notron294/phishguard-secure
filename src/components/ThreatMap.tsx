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
  med: "var(--primary)",
  high: "var(--warning)",
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

      <div className="relative aspect-[2/1] w-full bg-[oklch(0.13_0.012_260)]">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(1 0 0 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <svg
          viewBox="0 0 1000 500"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Stylized continent silhouettes (very low-fi, dot-grid style) */}
          <g fill="oklch(0.28 0.012 260)" stroke="oklch(0.32 0.014 260)" strokeWidth="0.5">
            {/* North America */}
            <path d="M 130 110 Q 180 90 240 100 Q 290 115 300 160 Q 305 200 270 230 Q 230 250 200 240 Q 160 225 140 195 Q 120 160 130 110 Z" />
            {/* South America */}
            <path d="M 270 270 Q 305 265 320 295 Q 330 340 315 380 Q 300 420 285 415 Q 270 405 268 370 Q 265 320 270 270 Z" />
            {/* Europe */}
            <path d="M 470 110 Q 510 100 540 115 Q 555 135 545 160 Q 525 175 495 170 Q 470 160 465 140 Q 462 122 470 110 Z" />
            {/* Africa */}
            <path d="M 490 200 Q 540 195 565 225 Q 575 270 555 320 Q 535 360 510 360 Q 485 350 478 310 Q 472 260 490 200 Z" />
            {/* Asia */}
            <path d="M 580 110 Q 680 95 770 120 Q 820 145 810 195 Q 790 230 720 235 Q 650 230 600 210 Q 570 180 580 110 Z" />
            {/* Australia */}
            <path d="M 770 320 Q 825 315 855 335 Q 865 360 840 375 Q 800 380 775 365 Q 760 345 770 320 Z" />
          </g>

          {/* Lat/Lng faint guides */}
          <g stroke="oklch(1 0 0 / 0.04)" strokeWidth="0.5">
            <line x1="0" y1="250" x2="1000" y2="250" />
            <line x1="500" y1="0" x2="500" y2="500" />
          </g>

          {/* Hotspots */}
          {HOTSPOTS.map((h, i) => {
            const { x, y } = project(h.lat, h.lng);
            const color = SEV[h.severity];
            const r = h.severity === "crit" ? 4 : h.severity === "high" ? 3.2 : 2.6;
            return (
              <g key={i}>
                {/* Continuous slow pulse ring */}
                <circle cx={x} cy={y} r={r}>
                  <animate
                    attributeName="r"
                    values={`${r};${r * 4};${r}`}
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin={`${i * 0.18}s`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0;0.6"
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin={`${i * 0.18}s`}
                  />
                  <animate attributeName="fill" to={color} fill="freeze" />
                </circle>
                {/* Solid core */}
                <circle cx={x} cy={y} r={r} fill={color}>
                  <title>
                    {h.city}, {h.country} — {h.count.toLocaleString()} events
                  </title>
                </circle>
              </g>
            );
          })}

          {/* Random "ping" attacks fired at hotspots */}
          {pings.map((p) => {
            const h = HOTSPOTS[p.idx];
            const { x, y } = project(h.lat, h.lng);
            const color = SEV[h.severity];
            return (
              <g key={p.id}>
                <circle cx={x} cy={y} r="2" fill="none" stroke={color} strokeWidth="1.5">
                  <animate attributeName="r" from="2" to="28" dur="2.2s" fill="freeze" />
                  <animate
                    attributeName="opacity"
                    from="0.9"
                    to="0"
                    dur="2.2s"
                    fill="freeze"
                  />
                </circle>
                <circle cx={x} cy={y} r="1.5" fill={color}>
                  <animate attributeName="opacity" from="1" to="0" dur="2.2s" fill="freeze" />
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
              ["Medium", "var(--primary)"],
              ["High", "var(--warning)"],
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
