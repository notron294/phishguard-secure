import { TrendingUp, TrendingDown, Flame } from "lucide-react";
import { ThreatMap } from "./ThreatMap";

interface Threat {
  rank: number;
  name: string;
  category: string;
  volatility: number; // % change last 24h
  detection: number; // 0-100
  severity: "Low" | "Medium" | "High" | "Critical";
  volume: string;
}

const THREATS: Threat[] = [
  { rank: 1, name: "Apple ID Suspension", category: "Brand impersonation", volatility: 18.4, detection: 97, severity: "Critical", volume: "412.8K" },
  { rank: 2, name: "DHL Package Hold", category: "Logistics scam", volatility: 12.1, detection: 94, severity: "High", volume: "298.2K" },
  { rank: 3, name: "MFA Push Fatigue", category: "Account takeover", volatility: 8.7, detection: 91, severity: "Critical", volume: "241.6K" },
  { rank: 4, name: "Microsoft 365 Quarantine", category: "Credential theft", volatility: -3.2, detection: 96, severity: "High", volume: "188.0K" },
  { rank: 5, name: "Crypto Wallet Drainer", category: "Web3 phishing", volatility: 42.6, detection: 88, severity: "Critical", volume: "164.3K" },
  { rank: 6, name: "HR Payroll Update", category: "BEC", volatility: 5.4, detection: 82, severity: "Medium", volume: "121.7K" },
  { rank: 7, name: "Netflix Billing Failure", category: "Brand impersonation", volatility: -7.8, detection: 93, severity: "Medium", volume: "98.5K" },
  { rank: 8, name: "QR Code Phish (quishing)", category: "Vector evolution", volatility: 31.2, detection: 79, severity: "High", volume: "84.1K" },
];

const sevColor = (s: Threat["severity"]) => {
  switch (s) {
    case "Critical": return "text-critical bg-critical/10 border-critical/30";
    case "High": return "text-warning bg-warning/10 border-warning/30";
    case "Medium": return "text-primary bg-primary/10 border-primary/30";
    default: return "text-success bg-success/10 border-success/30";
  }
};

export function ThreatMarket() {
  return (
    <section id="stats" className="px-6 py-20 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <Flame className="mr-1 inline h-3 w-3 text-warning" />
              Threat market · live feed
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              Current phishing campaigns
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Ranked by global detection volume across the PhishGuard network in the last 24 hours.
            </p>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <span className="rounded-full border border-border bg-surface px-2.5 py-1">24h</span>
            <span className="rounded-full bg-foreground px-2.5 py-1 text-background">7d</span>
            <span className="rounded-full border border-border bg-surface px-2.5 py-1">30d</span>
          </div>
        </div>

        <ThreatMap />

        <div className="overflow-hidden rounded-2xl border border-border bg-surface/40 backdrop-blur">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">Campaign</th>
                  <th className="px-4 py-3 text-right font-medium">Volatility 24h</th>
                  <th className="px-4 py-3 text-right font-medium">Detection rate</th>
                  <th className="px-4 py-3 text-right font-medium">Volume</th>
                  <th className="px-4 py-3 text-right font-medium">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {THREATS.map((t) => {
                  const up = t.volatility >= 0;
                  return (
                    <tr key={t.rank} className="group transition hover:bg-surface/60">
                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{t.rank}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-foreground">{t.name}</div>
                        <div className="text-[11px] text-muted-foreground">{t.category}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono">
                        <span
                          className={`inline-flex items-center gap-1 ${up ? "text-success" : "text-critical"}`}
                        >
                          {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                          {up ? "+" : ""}{t.volatility.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="ml-auto flex w-32 items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${t.detection}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">{t.detection}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-xs text-muted-foreground">{t.volume}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${sevColor(t.severity)}`}>
                          {t.severity}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
