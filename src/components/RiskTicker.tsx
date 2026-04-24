import { useEffect, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ScanResult } from "@/lib/phishing";

const TRENDS = [
  { label: "Global Phish Index", base: 72.4, vol: 1.2 },
  { label: "Brand Impersonation", base: 41.7, vol: 0.9 },
  { label: "Credential Theft", base: 58.3, vol: 1.6 },
  { label: "Malware Payloads", base: 22.1, vol: 0.7 },
];

export function RiskTicker({ result }: { result: ScanResult | null }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(i);
  }, []);

  const sevColor =
    result?.severity === "critical"
      ? "text-critical"
      : result?.severity === "warning"
        ? "text-warning"
        : result
          ? "text-success"
          : "text-muted-foreground";

  return (
    <div className="border-y border-border bg-surface/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-6 py-3 text-xs">
        <div className="flex shrink-0 items-center gap-2 font-medium">
          <Activity className="h-3.5 w-3.5 text-primary ticker-pulse" />
          <span className="uppercase tracking-wider text-muted-foreground">Live</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-muted-foreground">Your scan:</span>
          <span className={`font-mono font-semibold ${sevColor}`}>
            {result ? `${result.riskScore}/100` : "—"}
          </span>
        </div>

        <div className="h-4 w-px bg-border" />

        {TRENDS.map((t, idx) => {
          const drift = Math.sin((tick + idx) * 0.7) * t.vol;
          const value = (t.base + drift).toFixed(2);
          const up = drift > 0;
          return (
            <div key={t.label} className="flex shrink-0 items-center gap-2">
              <span className="text-muted-foreground">{t.label}</span>
              <span className="font-mono font-medium text-foreground">{value}</span>
              <span
                className={`flex items-center gap-0.5 font-mono text-[11px] ${
                  up ? "text-critical" : "text-success"
                }`}
              >
                {up ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(drift).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
