import { BookOpen, Download, Lightbulb, Send } from "lucide-react";
import type { ScanResult } from "@/lib/phishing";

export function LogicBreakdown({ result }: { result: ScanResult }) {
  return (
    <section id="insight" className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Lightbulb className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">Logic breakdown</h3>
            <p className="text-xs text-muted-foreground">
              Why our engine reached this verdict
            </p>
          </div>
        </div>

        <ol className="space-y-3">
          {result.insights.map((insight, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="font-mono text-xs font-semibold text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-foreground/90">{insight}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-xl border border-border bg-surface/40 p-4">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Phishing tactic spotlight
          </p>
          <p className="text-sm text-foreground/90">
            Attackers exploit <span className="font-semibold">authority</span> +{" "}
            <span className="font-semibold">urgency</span>: an apparent brand sender plus a
            countdown ("24 hours") makes targets bypass critical thinking. Trust the domain, not
            the display name.
          </p>
        </div>
      </div>

      <div id="learn" className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/15 text-success">
          <BookOpen className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold">What to do next</h3>
        <p className="text-xs text-muted-foreground">
          Don't just delete it — turn this scan into action.
        </p>

        <div className="mt-2 space-y-2">
          <button className="flex w-full items-center justify-between rounded-xl border border-border bg-surface/60 px-4 py-3 text-left text-sm transition hover:border-border-strong hover:bg-surface">
            <span className="flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" />
              Report to IT / SOC
            </span>
            <span className="text-[11px] text-muted-foreground">→</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-xl border border-border bg-surface/60 px-4 py-3 text-left text-sm transition hover:border-border-strong hover:bg-surface">
            <span className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              Export forensic report
            </span>
            <span className="text-[11px] text-muted-foreground">PDF</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-xl border border-border bg-surface/60 px-4 py-3 text-left text-sm transition hover:border-border-strong hover:bg-surface">
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Take 2-min training
            </span>
            <span className="text-[11px] text-muted-foreground">Free</span>
          </button>
        </div>
      </div>
    </section>
  );
}
