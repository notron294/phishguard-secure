import { ShieldCheck } from "lucide-react";

export function PhishGuardNav() {
  return (
    <header className="glass sticky top-0 z-50 border-b border-border">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </span>
          PhishGuard
        </a>
        <ul className="hidden items-center gap-8 text-xs text-muted-foreground md:flex">
          <li><a className="transition hover:text-foreground" href="#scan">Scanner</a></li>
          <li><a className="transition hover:text-foreground" href="#dashboard">Dashboard</a></li>
          <li><a className="transition hover:text-foreground" href="#insight">Insights</a></li>
          <li><a className="transition hover:text-foreground" href="#learn">Learn</a></li>
        </ul>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-medium text-muted-foreground sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success ticker-pulse" />
            Engine live
          </span>
          <button className="rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition hover:opacity-90">
            Sign in
          </button>
        </div>
      </nav>
    </header>
  );
}
