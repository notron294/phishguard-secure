// ─── Phishing Map — Mock / Seed Data ─────────────────────────────────────────
// Replace `fetchMockCampaigns` with a real API call in usePhishingData.ts

import {
  PhishingCampaign,
  CampaignTarget,
  PhishingType,
  ThreatSeverity,
} from "@/types/phishingMap.types";

const COUNTRY_COORDS: Record<string, [number, number]> = {
  CN: [104.1954, 35.8617],
  RU: [105.3188, 61.524],
  NG: [8.6753, 9.082],
  KP: [127.5101, 40.3399],
  BR: [-51.9253, -14.235],
  IN: [78.9629, 20.5937],
  US: [-95.7129, 37.0902],
  DE: [10.4515, 51.1657],
  GB: [-3.4359, 55.3781],
  FR: [2.2137, 46.2276],
  AU: [133.7751, -25.2744],
  CA: [-96.8165, 56.1304],
  JP: [138.2529, 36.2048],
  KR: [127.7669, 35.9078],
  NL: [5.2913, 52.1326],
  UA: [31.1656, 48.3794],
  IR: [53.6880, 32.4279],
  PK: [69.3451, 30.3753],
};

const LURE_SUBJECTS: Record<string, string[]> = {
  "credential-harvest": [
    "Your account has been suspended",
    "Verify your identity immediately",
    "Unusual sign-in activity detected",
    "Your password expires today",
  ],
  "malware-delivery": [
    "Invoice #INV-2024-8821 attached",
    "DHL: Your parcel could not be delivered",
    "Important document requires your signature",
    "Q4 Financial Report — Confidential",
  ],
  bec: [
    "Urgent wire transfer request",
    "RE: Vendor payment update",
    "CEO: Please process ASAP",
  ],
  "spear-phishing": [
    "Following up on our meeting",
    "Your LinkedIn connection request",
    "Regarding your recent application",
  ],
  smishing: ["Your bank account is locked", "Package delivery failed — rebook"],
  vishing: ["IRS final notice", "Your Social Security suspended"],
};

const THREAT_ACTORS = ["APT29", "Lazarus Group", "Fancy Bear", "Scattered Spider", "TA505", "Unknown"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

/** Generate a realistic-looking mock campaign set */
export function generateMockCampaigns(): PhishingCampaign[] {
  const campaigns: PhishingCampaign[] = [
    {
      id: "camp-001",
      name: "Operation SilverHook",
      type: "credential-harvest",
      severity: "critical",
      sourceCountry: "RU",
      sourceCoords: COUNTRY_COORDS.RU,
      targets: [
        { country: "US", coords: COUNTRY_COORDS.US, hits: 14200 },
        { country: "DE", coords: COUNTRY_COORDS.DE, hits: 8700 },
        { country: "GB", coords: COUNTRY_COORDS.GB, hits: 6300 },
      ],
      volume: 340000,
      blocked: 318000,
      startedAt: hoursAgo(6),
      active: true,
      actor: "APT29",
      lures: LURE_SUBJECTS["credential-harvest"],
    },
    {
      id: "camp-002",
      name: "LazarusInvoice",
      type: "malware-delivery",
      severity: "critical",
      sourceCountry: "KP",
      sourceCoords: COUNTRY_COORDS.KP,
      targets: [
        { country: "KR", coords: COUNTRY_COORDS.KR, hits: 5200 },
        { country: "JP", coords: COUNTRY_COORDS.JP, hits: 4100 },
        { country: "US", coords: COUNTRY_COORDS.US, hits: 9800 },
      ],
      volume: 220000,
      blocked: 196000,
      startedAt: hoursAgo(12),
      active: true,
      actor: "Lazarus Group",
      lures: LURE_SUBJECTS["malware-delivery"],
    },
    {
      id: "camp-003",
      name: "NigerianBEC-Wave4",
      type: "bec",
      severity: "high",
      sourceCountry: "NG",
      sourceCoords: COUNTRY_COORDS.NG,
      targets: [
        { country: "AU", coords: COUNTRY_COORDS.AU, hits: 1800 },
        { country: "CA", coords: COUNTRY_COORDS.CA, hits: 2200 },
        { country: "GB", coords: COUNTRY_COORDS.GB, hits: 1600 },
      ],
      volume: 58000,
      blocked: 51000,
      startedAt: hoursAgo(2),
      active: true,
      actor: "Unknown",
      lures: LURE_SUBJECTS.bec,
    },
    {
      id: "camp-004",
      name: "DragonSpear-EU",
      type: "spear-phishing",
      severity: "high",
      sourceCountry: "CN",
      sourceCoords: COUNTRY_COORDS.CN,
      targets: [
        { country: "DE", coords: COUNTRY_COORDS.DE, hits: 920 },
        { country: "FR", coords: COUNTRY_COORDS.FR, hits: 740 },
        { country: "NL", coords: COUNTRY_COORDS.NL, hits: 610 },
      ],
      volume: 12000,
      blocked: 10800,
      startedAt: hoursAgo(18),
      active: true,
      actor: "APT41",
      lures: LURE_SUBJECTS["spear-phishing"],
    },
    {
      id: "camp-005",
      name: "IranSmish-MENA",
      type: "smishing",
      severity: "medium",
      sourceCountry: "IR",
      sourceCoords: COUNTRY_COORDS.IR,
      targets: [
        { country: "DE", coords: COUNTRY_COORDS.DE, hits: 3400 },
        { country: "FR", coords: COUNTRY_COORDS.FR, hits: 2800 },
      ],
      volume: 85000,
      blocked: 77000,
      startedAt: hoursAgo(36),
      active: false,
      actor: "Unknown",
      lures: LURE_SUBJECTS.smishing,
    },
    {
      id: "camp-006",
      name: "UkrainePKT-Drop",
      type: "malware-delivery",
      severity: "high",
      sourceCountry: "UA",
      sourceCoords: COUNTRY_COORDS.UA,
      targets: [
        { country: "PL", coords: [19.1451, 51.9194], hits: 4100 },
        { country: "DE", coords: COUNTRY_COORDS.DE, hits: 3800 },
      ],
      volume: 94000,
      blocked: 87000,
      startedAt: hoursAgo(4),
      active: true,
      actor: "TA505",
      lures: LURE_SUBJECTS["malware-delivery"],
    },
  ];

  return campaigns;
}

/** Simulates a live-data polling call. Swap this with your real endpoint. */
export async function fetchMockCampaigns(): Promise<PhishingCampaign[]> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 400));
  const base = generateMockCampaigns();

  // Add slight randomness so polling "updates" feel live
  return base.map((c) => ({
    ...c,
    volume: c.volume + randomBetween(0, 500),
    blocked: c.blocked + randomBetween(0, 480),
    targets: c.targets.map((t: CampaignTarget) => ({ ...t, hits: t.hits + randomBetween(0, 50) })),
  }));
}
