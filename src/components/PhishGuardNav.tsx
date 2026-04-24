import { ShieldCheck, Github, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// X.com (Twitter) logo as inline SVG — Lucide doesn't ship the new X mark
function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2H21.5l-7.523 8.594L22.5 22h-6.836l-5.36-7.013L4.2 22H.94l8.046-9.193L1.5 2h6.99l4.85 6.413L18.244 2Zm-1.198 18.4h1.86L7.04 3.5H5.06l11.986 16.9Z" />
    </svg>
  );
}

const LANGS = [
  { code: "EN", label: "English" },
  { code: "DE", label: "Deutsch" },
] as const;

export function PhishGuardNav() {
  const [lang, setLang] = useState<"EN" | "DE">("EN");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="glass sticky top-0 z-50 border-b border-border">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </span>
          Detect-Stats-Learn-Api
        </a>
        <ul className="hidden items-center gap-8 text-xs text-muted-foreground md:flex">
          <li><a className="transition hover:text-foreground" href="#scan">Detect</a></li>
          <li><a className="transition hover:text-foreground" href="#stats">Stats</a></li>
          <li><a className="transition hover:text-foreground" href="#learn">Learn</a></li>
          <li><a className="transition hover:text-foreground" href="#api">API</a></li>
          <li><a className="transition hover:text-foreground" href="#playground">Playground</a></li>
        </ul>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-medium text-muted-foreground lg:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success ticker-pulse" />
            Engine live
          </span>

          {/* Social icons */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
            className="hidden h-8 w-8 items-center justify-center rounded-full border border-border bg-surface/60 text-muted-foreground transition hover:border-border-strong hover:text-foreground sm:inline-flex"
          >
            <Github className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="X (Twitter)"
            className="hidden h-8 w-8 items-center justify-center rounded-full border border-border bg-surface/60 text-muted-foreground transition hover:border-border-strong hover:text-foreground sm:inline-flex"
          >
            <XLogo className="h-3 w-3" />
          </a>

          {/* Language toggle */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex h-8 items-center gap-1 rounded-full border border-border bg-surface/60 px-2.5 text-[11px] font-medium text-foreground transition hover:border-border-strong"
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <span className="font-mono">{lang}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            {open && (
              <ul
                role="listbox"
                className="glass absolute right-0 mt-2 w-32 overflow-hidden rounded-xl border border-border shadow-elevated"
                style={{ boxShadow: "var(--shadow-elevated)" }}
              >
                {LANGS.map((l) => (
                  <li key={l.code}>
                    <button
                      onClick={() => {
                        setLang(l.code);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-xs transition hover:bg-surface ${
                        lang === l.code ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <span>{l.label}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{l.code}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button className="rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition hover:opacity-90">
            Sign in
          </button>
        </div>
      </nav>
    </header>
  );
}
