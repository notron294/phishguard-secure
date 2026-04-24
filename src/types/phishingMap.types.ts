// ─── Phishing Map — Type Definitions ─────────────────────────────────────────

export type PhishingType =
  | "credential-harvest"
  | "malware-delivery"
  | "bec"           // Business Email Compromise
  | "smishing"
  | "vishing"
  | "spear-phishing";

export type ThreatSeverity = "critical" | "high" | "medium" | "low";

/** A single active phishing campaign */
export interface PhishingCampaign {
  id: string;
  name: string;
  type: PhishingType;
  severity: ThreatSeverity;

  /** ISO 3166-1 alpha-2 country code */
  sourceCountry: string;
  sourceCoords: [number, number]; // [longitude, latitude]

  /** Countries being targeted */
  targets: CampaignTarget[];

  /** How many emails sent in this campaign */
  volume: number;

  /** Emails detected & blocked */
  blocked: number;

  /** Campaign start time (ISO string) */
  startedAt: string;

  /** Is this campaign live right now? */
  active: boolean;

  /** Campaign actor / threat group (optional) */
  actor?: string;

  /** Lure subject lines spotted */
  lures?: string[];
}

export interface CampaignTarget {
  country: string;
  coords: [number, number]; // [longitude, latitude]
  hits: number;
}

/** A point to render on the map (source or target marker) */
export interface MapMarker {
  id: string;
  coords: [number, number];
  label: string;
  type: "source" | "target";
  severity: ThreatSeverity;
  campaignId: string;
}

/** An attack arc between source and a target */
export interface AttackArc {
  id: string;
  campaignId: string;
  source: [number, number];
  target: [number, number];
  type: PhishingType;
  severity: ThreatSeverity;
  volume: number;
}

/** Stats summary shown in the sidebar */
export interface MapStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalEmailsDetected: number;
  totalBlocked: number;
  topSourceCountry: string;
  topTargetCountry: string;
  criticalCount: number;
}

/** Config options for the map component */
export interface PhishingMapConfig {
  /** Poll interval in ms. Set to 0 to disable polling. Default: 30000 */
  pollIntervalMs?: number;

  /** Callback when a campaign is selected */
  onCampaignSelect?: (campaign: PhishingCampaign | null) => void;

  /** Custom fetch function — replace with your API call */
  fetchCampaigns?: () => Promise<PhishingCampaign[]>;

  /** Show arc animations? Default: true */
  animateArcs?: boolean;

  /** Map color theme */
  theme?: "dark" | "light";
}

// ─── Colour helpers ───────────────────────────────────────────────────────────

export const SEVERITY_COLORS: Record<ThreatSeverity, string> = {
  critical: "#FF2D55",
  high:     "#FF6B35",
  medium:   "#FFD166",
  low:      "#06D6A0",
};

export const TYPE_LABELS: Record<PhishingType, string> = {
  "credential-harvest": "Credential Harvest",
  "malware-delivery":   "Malware Delivery",
  "bec":                "Business Email Compromise",
  "smishing":           "Smishing",
  "vishing":            "Vishing",
  "spear-phishing":     "Spear Phishing",
};
