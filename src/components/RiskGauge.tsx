import type { ScanResult } from "@/lib/phishing";

export function RiskGauge({ result }: { result: ScanResult }) {
  const { riskScore, severity, verdict, urgencyMeter } = result;

  const color =
    severity === "critical"
      ? "var(--critical)"
      : severity === "warning"
        ? "var(--warning)"
        : "var(--success)";

  const glow =
    severity === "critical"
      ? "var(--shadow-glow-critical)"
      : severity === "warning"
        ? "var(--shadow-glow-warning)"
        : "var(--shadow-glow-success)";

  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (riskScore / 100) * circumference;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-6"
      style={{ boxShadow: glow }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Risk score
          </p>
          <p className="mt-1 text-sm text-foreground">{verdict}</p>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: `color-mix(in oklch, ${color} 18%, transparent)`,
            color,
          }}
        >
          {severity}
        </span>
      </div>

      <div className="mt-6 flex items-center gap-6">
        <div className="relative h-44 w-44 shrink-0">
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
            <circle cx="80" cy="80" r="70" stroke="var(--border)" strokeWidth="10" fill="none" />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke={color}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-mono text-5xl font-semibold tracking-tight"
              style={{ color, fontFamily: "var(--font-mono)" }}
            >
              {riskScore}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              / 100
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <Meter label="Psychological pressure" value={urgencyMeter} color="var(--warning)" />
          <Meter
            label="Confidence"
            value={Math.round(
              result.flags.reduce((a, f) => a + f.confidence, 0) / result.flags.length,
            )}
            color="var(--primary)"
          />
          <Meter
            label="Red flags triggered"
            value={Math.min(
              100,
              (result.flags.filter((f) => f.severity !== "success").length /
                result.flags.length) *
                100,
            )}
            color={color}
          />
        </div>
      </div>
    </div>
  );
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium text-foreground">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
