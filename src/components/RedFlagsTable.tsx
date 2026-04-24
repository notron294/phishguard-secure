import { ArrowDownRight, ArrowUpRight, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import type { RedFlag, ScanResult } from "@/lib/phishing";

const sevIcon: Record<RedFlag["severity"], React.ReactNode> = {
  success: <ShieldCheck className="h-3.5 w-3.5" />,
  warning: <ShieldQuestion className="h-3.5 w-3.5" />,
  critical: <ShieldAlert className="h-3.5 w-3.5" />,
};

const sevColor: Record<RedFlag["severity"], string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  critical: "var(--critical)",
};

export function RedFlagsTable({ result }: { result: ScanResult }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold">Detected indicators</h3>
          <p className="text-xs text-muted-foreground">
            Ranked by impact on the final risk score
          </p>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {result.flags.length} signals
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-2.5 text-left font-medium">#</th>
              <th className="px-5 py-2.5 text-left font-medium">Indicator</th>
              <th className="px-5 py-2.5 text-left font-medium">Detail</th>
              <th className="px-5 py-2.5 text-right font-medium">Confidence</th>
              <th className="px-5 py-2.5 text-right font-medium">Risk Δ</th>
              <th className="px-5 py-2.5 text-right font-medium">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {result.flags
              .slice()
              .sort((a, b) => b.delta - a.delta)
              .map((f, i) => {
                const color = sevColor[f.severity];
                const up = f.delta > 0;
                return (
                  <tr
                    key={f.id}
                    className="group border-b border-border/60 transition hover:bg-surface/40 last:border-0"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{
                            color,
                            backgroundColor: `color-mix(in oklch, ${color} 14%, transparent)`,
                          }}
                        >
                          {sevIcon[f.severity]}
                        </span>
                        <div>
                          <p className="font-medium leading-tight">{f.signal}</p>
                          <p className="text-[11px] text-muted-foreground">{f.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-md px-5 py-4 text-xs text-muted-foreground">
                      {f.detail}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-xs">{f.confidence}%</td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 font-mono text-xs font-medium ${
                          up ? "text-critical" : "text-success"
                        }`}
                      >
                        {up ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {up ? "+" : ""}
                        {f.delta}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          color,
                          backgroundColor: `color-mix(in oklch, ${color} 14%, transparent)`,
                        }}
                      >
                        {f.severity}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
