export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden px-6 pt-24 pb-16 text-center sm:pt-32 sm:pb-24"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="relative z-10 mx-auto max-w-3xl fade-up">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          v3.2 — Real-time threat intelligence
        </span>
        <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-7xl">
          Catch phishing
          <br />
          <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            before it catches you.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          Drop an email. Get a forensic risk report in under a second — sender reputation, link
          safety, syntax analysis and psychological pressure metrics.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <span>SOC 2 Type II</span>
          <span className="h-1 w-1 rounded-full bg-border-strong" />
          <span>Zero data retention</span>
          <span className="h-1 w-1 rounded-full bg-border-strong" />
          <span>10M+ scans</span>
        </div>
      </div>
    </section>
  );
}
