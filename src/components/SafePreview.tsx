import { EyeOff, Link2Off, ShieldCheck } from "lucide-react";
import type { ScanResult } from "@/lib/phishing";

export function SafePreview({ result }: { result: ScanResult }) {
  const { safePreview } = result;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border bg-surface/40 px-5 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <EyeOff className="h-3.5 w-3.5" />
          Sandboxed preview · links disabled
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
          <ShieldCheck className="h-3 w-3" /> Safe
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-1 border-b border-border pb-3 text-sm">
          <Row label="From" value={safePreview.from} mono />
          <Row label="Subject" value={safePreview.subject} bold />
        </div>

        <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
          {safePreview.bodyLines.length === 0 ? (
            <p className="text-muted-foreground">No body content extracted.</p>
          ) : (
            safePreview.bodyLines.map((line, i) => <p key={i}>{line}</p>)
          )}
        </div>

        {safePreview.links.length > 0 && (
          <div className="rounded-xl border border-border bg-surface/40 p-3">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Disarmed links ({safePreview.links.length})
            </p>
            <ul className="space-y-1.5">
              {safePreview.links.map((l, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 font-mono text-xs"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <Link2Off
                    className="h-3 w-3 shrink-0"
                    style={{
                      color: l.suspicious ? "var(--critical)" : "var(--muted-foreground)",
                    }}
                  />
                  <span
                    className={l.suspicious ? "text-critical" : "text-muted-foreground"}
                    style={{ textDecoration: "line-through" }}
                  >
                    {l.display}
                  </span>
                  {l.suspicious && (
                    <span className="rounded bg-critical/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-critical">
                      blocked
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="flex gap-3 text-xs">
      <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
      <span
        className={`flex-1 break-all ${bold ? "font-semibold text-foreground" : "text-foreground/90"}`}
        style={mono ? { fontFamily: "var(--font-mono)" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
