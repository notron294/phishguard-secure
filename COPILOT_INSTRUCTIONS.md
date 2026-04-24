# PhishingMap — Copilot Integration Instructions

> **Hand this file to GitHub Copilot** (paste it as a comment, add it as a `.github/copilot-instructions.md`, or prefix your Copilot Chat prompt with its contents). It gives Copilot all the context needed to drop the PhishingMap into your existing webapp and wire it to your real API.

---

## 1 · What you're integrating

`PhishingMap` is a React + TypeScript world-map component that visualises live phishing campaigns. It renders attack arcs between source and target countries, pulsing severity markers, a stats sidebar, and tooltips — all in a dark cybersecurity theme.

**File layout (copy these into your project):**

```
src/
  components/
    PhishingMap.tsx   ← main component
    PhishingMap.css   ← styles (imported inside the component)
  hooks/
    usePhishingData.ts
  data/
    mockCampaigns.ts  ← replace with real API call
  types/
    phishingMap.types.ts
  index.ts            ← barrel export
```

---

## 2 · Install dependencies

```bash
npm install react-simple-maps d3-geo d3-interpolate
npm install --save-dev @types/d3-geo
```

If the project uses **Vite** add this to `vite.config.ts` to avoid CommonJS interop issues:

```ts
optimizeDeps: { include: ["react-simple-maps", "d3-geo"] }
```

---

## 3 · Replace the current map

Find the component that currently renders the map (e.g. `MapView.tsx`, `Dashboard.tsx`, or wherever `<Map … />` appears) and replace it:

```tsx
// Before
import { OldMap } from "./OldMap";
// <OldMap />

// After
import { PhishingMap } from "@/components/PhishingMap"; // adjust path

<PhishingMap
  pollIntervalMs={30_000}          // re-fetch every 30 s
  animateArcs={true}
  onCampaignSelect={(campaign) => {
    // forward to your detail panel / state manager
    console.log("Selected:", campaign);
  }}
  fetchCampaigns={fetchActiveCampaigns} // ← your real API call (see §4)
/>
```

The component fills its parent `div`. Wrap it in a sized container if needed:

```tsx
<div style={{ width: "100%", height: "600px" }}>
  <PhishingMap … />
</div>
```

---

## 4 · Connect your real API

Open `src/data/mockCampaigns.ts` (or wherever you keep your API layer) and write a function that returns `Promise<PhishingCampaign[]>`.

The shape Copilot must produce:

```ts
import { PhishingCampaign } from "../types/phishingMap.types";

export async function fetchActiveCampaigns(): Promise<PhishingCampaign[]> {
  const res = await fetch("/api/phishing/campaigns/active");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();

  // Map your API response → PhishingCampaign[]
  return raw.map((item: any): PhishingCampaign => ({
    id:            item.id,
    name:          item.campaign_name,
    type:          item.attack_type,          // must be PhishingType union value
    severity:      item.risk_level,           // "critical" | "high" | "medium" | "low"
    sourceCountry: item.origin_country_code,  // ISO 3166-1 alpha-2
    sourceCoords:  [item.origin_lon, item.origin_lat],
    targets: item.targets.map((t: any) => ({
      country: t.country_code,
      coords:  [t.longitude, t.latitude],
      hits:    t.email_count,
    })),
    volume:    item.total_emails,
    blocked:   item.blocked_emails,
    startedAt: item.first_seen,
    active:    item.status === "active",
    actor:     item.threat_actor ?? undefined,
    lures:     item.sample_subjects ?? [],
  }));
}
```

Then pass it to the component:

```tsx
import { fetchActiveCampaigns } from "@/data/campaigns";

<PhishingMap fetchCampaigns={fetchActiveCampaigns} />
```

**If your backend pushes updates via WebSocket**, disable polling and call a refresh function instead:

```ts
const { refresh } = usePhishingData({ pollIntervalMs: 0 });

// In your WS message handler:
socket.on("campaign:update", () => refresh());
```

---

## 5 · Routing geo-coordinates

The map expects coordinates as `[longitude, latitude]` (GeoJSON order — **longitude first**).

If your API returns `{ lat, lng }` objects:
```ts
sourceCoords: [item.origin.lng, item.origin.lat],  // ← lng first!
```

---

## 6 · TypeScript types Copilot should respect

```ts
type PhishingType =
  | "credential-harvest"
  | "malware-delivery"
  | "bec"
  | "smishing"
  | "vishing"
  | "spear-phishing";

type ThreatSeverity = "critical" | "high" | "medium" | "low";
```

Map your backend enum/string values to these literals in the adapter (§4).

---

## 7 · Customisation hooks Copilot can extend

| What to change | Where |
|---|---|
| Map projection / center / scale | `PhishingMap.tsx` → `<ComposableMap projectionConfig={…}>` |
| Colour palette | `PhishingMap.css` → CSS variables in `.phishing-map-root` |
| Poll interval | `<PhishingMap pollIntervalMs={60_000} />` |
| Sidebar stats | `StatsPanel` sub-component in `PhishingMap.tsx` |
| Marker sizes | `PulsingMarker` `size` prop |
| Arc dash animation speed | `PhishingMap.css` → `@keyframes arc-march` + `animation-duration` |
| Tooltip content | `CampaignTooltip` sub-component |
| Disable animations | `<PhishingMap animateArcs={false} />` |

---

## 8 · Quick-test without a real API

Import and render the component with no props — it will use the built-in mock data and auto-refresh every 30 s with slight randomisation so the map feels live:

```tsx
import { PhishingMap } from "@/components/PhishingMap";

export default function TestPage() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <PhishingMap />
    </div>
  );
}
```

---

## 9 · Copilot prompt template

Use this prompt in Copilot Chat to trigger the integration automatically:

```
Using the PhishingMap component from COPILOT_INSTRUCTIONS.md:
1. Remove the existing map component from [FILE].
2. Add `<PhishingMap fetchCampaigns={fetchActiveCampaigns} pollIntervalMs={30000} animateArcs={true} />` in its place.
3. Create `fetchActiveCampaigns` in `src/data/campaigns.ts` that calls `GET /api/phishing/campaigns/active` and maps the response to `PhishingCampaign[]`.
4. Ensure the parent container has `width: 100%; height: 600px`.
5. Run `npm install react-simple-maps d3-geo d3-interpolate` as a terminal command.
```

Replace `[FILE]` with the actual filename (e.g. `src/pages/Dashboard.tsx`).
