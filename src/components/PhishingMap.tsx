// ─── PhishingMap.tsx ──────────────────────────────────────────────────────────
// World map overlay showing live phishing campaigns.
// Requires: react-simple-maps  d3-geo  d3-interpolate
// Install:  npm install react-simple-maps d3-geo d3-interpolate

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup,
} from "@/vendor/react-simple-maps";

import { usePhishingData } from "@/hooks/usePhishingData";
import {
  PhishingCampaign,
  CampaignTarget,
  PhishingMapConfig,
  MapMarker,
  AttackArc,
  SEVERITY_COLORS,
  TYPE_LABELS,
  ThreatSeverity,
  PhishingType,
} from "@/types/phishingMap.types";
import "./PhishingMap.css";

// ─── TopoJSON source (public CDN — no install needed) ────────────────────────
const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PulsingMarkerProps {
  coords: [number, number];
  color: string;
  size?: number;
  type: "source" | "target";
}

const PulsingMarker: React.FC<PulsingMarkerProps> = ({
  coords,
  color,
  size = 5,
  type,
}) => (
  <Marker coordinates={coords}>
    <g className={`phishing-marker phishing-marker--${type}`}>
      {/* Pulse rings */}
      <circle r={size * 2.8} fill={color} opacity={0.12} className="pulse-ring pulse-ring--1" />
      <circle r={size * 1.9} fill={color} opacity={0.2} className="pulse-ring pulse-ring--2" />
      {/* Core dot */}
      <circle
        r={type === "source" ? size : size * 0.7}
        fill={color}
        stroke={type === "source" ? "#fff" : "transparent"}
        strokeWidth={type === "source" ? 1 : 0}
        opacity={0.9}
      />
    </g>
  </Marker>
);

interface CampaignTooltipProps {
  campaign: PhishingCampaign;
  x: number;
  y: number;
}

const CampaignTooltip: React.FC<CampaignTooltipProps> = ({ campaign, x, y }) => {
  const blockRate = Math.round((campaign.blocked / campaign.volume) * 100);
  const color = SEVERITY_COLORS[campaign.severity];

  return (
    <div
      className="phishing-tooltip"
      style={{ left: x + 14, top: y - 10 }}
    >
      <div className="phishing-tooltip__header" style={{ borderColor: color }}>
        <span className="phishing-tooltip__severity" style={{ background: color }}>
          {campaign.severity.toUpperCase()}
        </span>
        <span className="phishing-tooltip__name">{campaign.name}</span>
      </div>
      <div className="phishing-tooltip__body">
        <Row label="Type" value={TYPE_LABELS[campaign.type]} />
        <Row label="Actor" value={campaign.actor ?? "Unknown"} />
        <Row label="Volume" value={campaign.volume.toLocaleString()} />
        <Row label="Blocked" value={`${blockRate}%`} />
        <Row label="Targets" value={campaign.targets.map((t: CampaignTarget) => t.country).join(", ")} />
        {campaign.lures && (
          <div className="phishing-tooltip__lure">
            <span className="row-label">Sample lure</span>
            <em>"{campaign.lures[0]}"</em>
          </div>
        )}
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="phishing-tooltip__row">
    <span className="row-label">{label}</span>
    <span className="row-value">{value}</span>
  </div>
);

// ─── Sidebar stats panel ──────────────────────────────────────────────────────

interface StatsPanelProps {
  stats: ReturnType<typeof usePhishingData>["stats"];
  lastUpdated: Date | null;
  onRefresh: () => void;
  selectedCampaign: PhishingCampaign | null;
  campaigns: PhishingCampaign[];
  onSelectCampaign: (c: PhishingCampaign | null) => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  stats,
  lastUpdated,
  onRefresh,
  selectedCampaign,
  campaigns,
  onSelectCampaign,
}) => (
  <aside className="phishing-sidebar">
    <header className="phishing-sidebar__header">
      <div className="phishing-sidebar__title">
        <span className="live-dot" />
        <h2>Threat Feed</h2>
      </div>
      <button className="phishing-sidebar__refresh" onClick={onRefresh} title="Refresh now">
        ↻
      </button>
    </header>

    {/* KPI grid */}
    <div className="phishing-kpi-grid">
      <Kpi label="Active Campaigns" value={stats.activeCampaigns} highlight />
      <Kpi label="Critical" value={stats.criticalCount} danger />
      <Kpi label="Emails Detected" value={fmt(stats.totalEmailsDetected)} />
      <Kpi label="Block Rate" value={`${Math.round((stats.totalBlocked / Math.max(stats.totalEmailsDetected, 1)) * 100)}%`} />
    </div>

    <div className="phishing-sidebar__divider" />

    {/* Campaign list */}
    <h3 className="phishing-sidebar__section-title">Campaigns</h3>
    <ul className="phishing-campaign-list">
      {campaigns.map((c) => (
        <li
          key={c.id}
          className={`phishing-campaign-item ${selectedCampaign?.id === c.id ? "phishing-campaign-item--active" : ""}`}
          onClick={() => onSelectCampaign(selectedCampaign?.id === c.id ? null : c)}
        >
          <span
            className="campaign-severity-dot"
            style={{ background: SEVERITY_COLORS[c.severity] }}
          />
          <div className="campaign-meta">
            <span className="campaign-name">{c.name}</span>
            <span className="campaign-sub">
              {c.sourceCountry} → {c.targets.map((t: CampaignTarget) => t.country).join(", ")} · {c.active ? "🟢 Live" : "⚫ Ended"}
            </span>
          </div>
          <span className="campaign-volume">{fmt(c.volume)}</span>
        </li>
      ))}
    </ul>

    {lastUpdated && (
      <p className="phishing-sidebar__updated">
        Updated {lastUpdated.toLocaleTimeString()}
      </p>
    )}
  </aside>
);

interface KpiProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  danger?: boolean;
}

const Kpi: React.FC<KpiProps> = ({ label, value, highlight, danger }) => (
  <div className={`phishing-kpi ${highlight ? "phishing-kpi--highlight" : ""} ${danger ? "phishing-kpi--danger" : ""}`}>
    <span className="phishing-kpi__value">{value}</span>
    <span className="phishing-kpi__label">{label}</span>
  </div>
);

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ─── Legend ───────────────────────────────────────────────────────────────────

const SEVERITY_ORDER: ThreatSeverity[] = ["critical", "high", "medium", "low"];

const Legend: React.FC = () => (
  <div className="phishing-legend">
    {SEVERITY_ORDER.map((s) => (
      <div key={s} className="phishing-legend__item">
        <span className="phishing-legend__dot" style={{ background: SEVERITY_COLORS[s] }} />
        <span>{s}</span>
      </div>
    ))}
    <div className="phishing-legend__item">
      <span className="phishing-legend__dot phishing-legend__dot--target" />
      <span>target</span>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const PhishingMap: React.FC<PhishingMapConfig> = ({
  pollIntervalMs = 30_000,
  onCampaignSelect,
  fetchCampaigns,
  animateArcs = true,
}) => {
  const { campaigns, arcs, markers, stats, loading, error, lastUpdated, refresh } =
    usePhishingData({ pollIntervalMs, fetchFn: fetchCampaigns });

  const [selectedCampaign, setSelectedCampaign] = useState<PhishingCampaign | null>(null);
  const [tooltip, setTooltip] = useState<{ campaign: PhishingCampaign; x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleSelectCampaign = useCallback(
    (c: PhishingCampaign | null) => {
      setSelectedCampaign(c);
      onCampaignSelect?.(c);
    },
    [onCampaignSelect]
  );

  const handleMarkerEnter = useCallback(
    (e: React.MouseEvent, campaignId: string) => {
      const campaign = campaigns.find((c: PhishingCampaign) => c.id === campaignId);
      if (!campaign) return;
      const rect = mapRef.current?.getBoundingClientRect();
      setTooltip({
        campaign,
        x: e.clientX - (rect?.left ?? 0),
        y: e.clientY - (rect?.top ?? 0),
      });
    },
    [campaigns]
  );

  const handleMarkerLeave = useCallback(() => setTooltip(null), []);

  // Filter arcs to selected campaign (or show all)
  const visibleArcs = useMemo(
    () =>
      selectedCampaign
        ? arcs.filter((a: AttackArc) => a.campaignId === selectedCampaign.id)
        : arcs,
    [arcs, selectedCampaign]
  );

  const visibleMarkers = useMemo(
    () =>
      selectedCampaign
        ? markers.filter((m: MapMarker) => m.campaignId === selectedCampaign.id)
        : markers,
    [markers, selectedCampaign]
  );

  return (
    <div className="phishing-map-root">
      {/* Sidebar */}
      <StatsPanel
        stats={stats}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
        selectedCampaign={selectedCampaign}
        campaigns={campaigns}
        onSelectCampaign={handleSelectCampaign}
      />

      {/* Map area */}
      <div className="phishing-map-area" ref={mapRef}>
        {loading && <div className="phishing-loading">Loading threat data…</div>}
        {error && <div className="phishing-error">⚠ {error}</div>}

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 140, center: [15, 20] }}
          className="phishing-composable-map"
        >
          <ZoomableGroup
            zoom={zoom}
            maxZoom={6}
            minZoom={1}
            onMoveEnd={({ zoom: z }: { zoom: number }) => setZoom(z)}
          >
            {/* Countries */}
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className="phishing-geo"
                  />
                ))
              }
            </Geographies>

            {/* Attack arcs */}
            {visibleArcs.map((arc: AttackArc) => (
              <Line
                key={arc.id}
                from={arc.source}
                to={arc.target}
                stroke={SEVERITY_COLORS[arc.severity]}
                strokeWidth={
                  arc.severity === "critical" ? 1.5
                  : arc.severity === "high"     ? 1.1
                  : 0.7
                }
                strokeOpacity={selectedCampaign ? 0.85 : 0.5}
                strokeLinecap="round"
                className={animateArcs ? "phishing-arc phishing-arc--animated" : "phishing-arc"}
              />
            ))}

            {/* Markers */}
            {visibleMarkers.map((m: MapMarker) => (
              <g
                key={m.id}
                onMouseEnter={(e) => handleMarkerEnter(e, m.campaignId)}
                onMouseLeave={handleMarkerLeave}
                onClick={() => {
                  const c = campaigns.find((c: PhishingCampaign) => c.id === m.campaignId);
                  handleSelectCampaign(c ?? null);
                }}
                style={{ cursor: "pointer" }}
              >
                <PulsingMarker
                  coords={m.coords}
                  color={SEVERITY_COLORS[m.severity]}
                  size={m.type === "source" ? 5 : 3}
                  type={m.type}
                />
              </g>
            ))}
          </ZoomableGroup>
        </ComposableMap>

        {/* Zoom controls */}
        <div className="phishing-zoom-controls">
          <button onClick={() => setZoom((z) => Math.min(z + 0.5, 6))}>+</button>
          <button onClick={() => setZoom((z) => Math.max(z - 0.5, 1))}>−</button>
        </div>

        {/* Legend */}
        <Legend />

        {/* Tooltip */}
        {tooltip && (
          <CampaignTooltip
            campaign={tooltip.campaign}
            x={tooltip.x}
            y={tooltip.y}
          />
        )}
      </div>
    </div>
  );
};

export default PhishingMap;
