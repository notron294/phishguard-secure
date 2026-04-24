import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PhishGuardNav } from "@/components/PhishGuardNav";
import { Hero } from "@/components/Hero";
import { Scanner } from "@/components/Scanner";
import { RiskTicker } from "@/components/RiskTicker";
import { RiskGauge } from "@/components/RiskGauge";
import { RedFlagsTable } from "@/components/RedFlagsTable";
import { SafePreview } from "@/components/SafePreview";
import { LogicBreakdown } from "@/components/LogicBreakdown";
import { EmptyDashboard } from "@/components/EmptyDashboard";
import { ThreatMarket } from "@/components/ThreatMarket";
import { LearnGrid } from "@/components/LearnGrid";
import { ApiSection } from "@/components/ApiSection";
import { Playground } from "@/components/Playground";
import { analyzeEmail, type ScanResult } from "@/lib/phishing";
import { smoothScrollToId } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Detect-Stats-Learn-Api — Phishing intelligence platform" },
      {
        name: "description",
        content:
          "Scan emails, URLs and sender addresses. Track trending phishing campaigns, learn the tactics, and integrate detection via API.",
      },
      { property: "og:title", content: "Detect-Stats-Learn-Api — Phishing intelligence" },
      {
        property: "og:description",
        content: "Apple-clean, CoinMarketCap-dense. Detect, rank, learn and integrate.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = (raw: string) => {
    setScanning(true);
    setTimeout(() => {
      setResult(analyzeEmail(raw));
      setScanning(false);
      requestAnimationFrame(() => {
        document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }, 700);
  };

  return (
    <div className="relative min-h-screen scroll-smooth">
      <PhishGuardNav />
      <main className="relative z-10">
        <Hero />
        <Scanner onScan={handleScan} scanning={scanning} />
        <RiskTicker result={result} />

        <section id="dashboard" className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Forensic dashboard
                </p>
                <h2 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {result ? "Scan results" : "Awaiting input"}
                </h2>
              </div>
              {result && (
                <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                  scan_id · {Math.random().toString(36).slice(2, 10)}
                </span>
              )}
            </div>

            {result ? (
              <div className="grid gap-6 fade-up">
                <div className="grid gap-6 lg:grid-cols-5">
                  <div className="lg:col-span-3">
                    <RiskGauge result={result} />
                  </div>
                  <div className="lg:col-span-2">
                    <SafePreview result={result} />
                  </div>
                </div>
                <RedFlagsTable result={result} />
                <LogicBreakdown result={result} />
              </div>
            ) : (
              <EmptyDashboard />
            )}
          </div>
        </section>

        <ThreatMarket />
        <LearnGrid />
        <ApiSection />
        <Playground />

        <footer className="border-t border-border px-6 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} Detect-Stats-Learn-Api. Built for security teams.</p>
            <div className="flex items-center gap-5">
              <a
                className="transition hover:text-foreground"
                href="#scan"
                onClick={(e) => {
                  e.preventDefault();
                  smoothScrollToId("#scan");
                }}
              >
                Detect
              </a>
              <a
                className="transition hover:text-foreground"
                href="#stats"
                onClick={(e) => {
                  e.preventDefault();
                  smoothScrollToId("#stats");
                }}
              >
                Stats
              </a>
              <a
                className="transition hover:text-foreground"
                href="#learn"
                onClick={(e) => {
                  e.preventDefault();
                  smoothScrollToId("#learn");
                }}
              >
                Learn
              </a>
              <a
                className="transition hover:text-foreground"
                href="#api"
                onClick={(e) => {
                  e.preventDefault();
                  smoothScrollToId("#api");
                }}
              >
                API
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
