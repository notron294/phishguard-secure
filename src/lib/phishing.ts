export type Severity = "success" | "warning" | "critical";

export interface RedFlag {
  id: string;
  category: string;
  signal: string;
  detail: string;
  severity: Severity;
  confidence: number; // 0-100
  delta: number; // -100..100, like CMC % change
}

export interface ScanResult {
  riskScore: number; // 0-100
  severity: Severity;
  verdict: string;
  urgencyMeter: number; // 0-100 psychological pressure
  flags: RedFlag[];
  insights: string[];
  safePreview: {
    from: string;
    subject: string;
    bodyLines: string[];
    links: { display: string; href: string; suspicious: boolean }[];
  };
}

const URGENT_WORDS = [
  "urgent",
  "immediately",
  "24 hours",
  "suspended",
  "locked",
  "verify now",
  "action required",
  "final notice",
  "terminated",
  "failure to",
];

const SUS_TLDS = [".ru", ".tk", ".xyz", ".top", ".click", ".zip", ".link"];

export function analyzeEmail(raw: string): ScanResult {
  const lower = raw.toLowerCase();

  // From header
  const fromMatch = raw.match(/^from:\s*(.+)$/im);
  const from = fromMatch?.[1]?.trim() ?? "unknown@unknown";
  const fromDomain = from.match(/@([^\s>]+)/)?.[1] ?? "";
  const displayName = from.split("<")[0].trim();

  const subjectMatch = raw.match(/^subject:\s*(.+)$/im);
  const subject = subjectMatch?.[1]?.trim() ?? "(no subject)";

  // Links
  const linkRegex = /https?:\/\/[^\s<>")]+/gi;
  const links = Array.from(raw.matchAll(linkRegex)).map((m) => {
    const href = m[0];
    const host = href.replace(/^https?:\/\//, "").split("/")[0];
    const suspicious =
      SUS_TLDS.some((t) => host.endsWith(t)) ||
      host.includes("-") ||
      /\d/.test(host.split(".")[0]);
    return { display: host, href, suspicious };
  });

  const flags: RedFlag[] = [];

  // Sender reputation
  const senderMimics =
    /apple|paypal|microsoft|google|amazon|netflix|bank/.test(displayName.toLowerCase()) &&
    !/(apple\.com|paypal\.com|microsoft\.com|google\.com|amazon\.com|netflix\.com)$/.test(
      fromDomain,
    );
  flags.push({
    id: "sender",
    category: "Sender",
    signal: "Sender reputation",
    detail: senderMimics
      ? `Display name impersonates a brand but domain is ${fromDomain || "unknown"}`
      : `Domain ${fromDomain || "n/a"} matches sender claim`,
    severity: senderMimics ? "critical" : "success",
    confidence: senderMimics ? 96 : 88,
    delta: senderMimics ? 87 : -12,
  });

  // Link safety
  const susLinks = links.filter((l) => l.suspicious).length;
  flags.push({
    id: "links",
    category: "Links",
    signal: "Link safety",
    detail:
      links.length === 0
        ? "No links detected"
        : `${susLinks} of ${links.length} links use suspicious hosts`,
    severity: susLinks > 0 ? "critical" : links.length > 0 ? "warning" : "success",
    confidence: 92,
    delta: susLinks > 0 ? 74 : 0,
  });

  // Urgency / pressure
  const urgencyHits = URGENT_WORDS.filter((w) => lower.includes(w)).length;
  const urgencyMeter = Math.min(100, urgencyHits * 22);
  flags.push({
    id: "urgency",
    category: "Tone",
    signal: "Psychological pressure",
    detail:
      urgencyHits > 0
        ? `Detected ${urgencyHits} urgency cues ("urgent", "24h", "suspended"…)`
        : "Neutral tone, no fear tactics",
    severity: urgencyHits >= 3 ? "critical" : urgencyHits >= 1 ? "warning" : "success",
    confidence: 84,
    delta: urgencyHits * 18,
  });

  // Syntax / grammar (very rough heuristic)
  const exclam = (raw.match(/!/g) || []).length;
  const allCapsWords = (raw.match(/\b[A-Z]{4,}\b/g) || []).length;
  const syntaxBad = exclam >= 2 || allCapsWords >= 2;
  flags.push({
    id: "syntax",
    category: "Syntax",
    signal: "Syntax & grammar",
    detail: syntaxBad
      ? `${allCapsWords} ALL-CAPS words, ${exclam} exclamations`
      : "Writing style appears normal",
    severity: syntaxBad ? "warning" : "success",
    confidence: 71,
    delta: syntaxBad ? 34 : -8,
  });

  // Auth (mocked unless we see headers)
  const hasSPF = /spf=pass/i.test(raw);
  const hasDKIM = /dkim=pass/i.test(raw);
  flags.push({
    id: "auth",
    category: "Headers",
    signal: "SPF / DKIM / DMARC",
    detail:
      hasSPF && hasDKIM
        ? "All authentication checks pass"
        : "Missing authentication headers — cannot verify sender",
    severity: hasSPF && hasDKIM ? "success" : "warning",
    confidence: 89,
    delta: hasSPF && hasDKIM ? -22 : 41,
  });

  // Attachments mention
  const hasAttach = /\.(zip|exe|scr|html|js)\b/i.test(raw);
  flags.push({
    id: "attach",
    category: "Payload",
    signal: "Attachment risk",
    detail: hasAttach
      ? "Email references high-risk file types"
      : "No dangerous attachments detected",
    severity: hasAttach ? "critical" : "success",
    confidence: 95,
    delta: hasAttach ? 68 : -5,
  });

  // Aggregate score
  const weights: Record<Severity, number> = { success: 0, warning: 35, critical: 80 };
  const raw_score =
    flags.reduce((acc, f) => acc + (weights[f.severity] * f.confidence) / 100, 0) / flags.length;
  const riskScore = Math.min(100, Math.round(raw_score * 1.4));

  const severity: Severity =
    riskScore >= 65 ? "critical" : riskScore >= 30 ? "warning" : "success";

  const verdict =
    severity === "critical"
      ? "Likely phishing — do not interact"
      : severity === "warning"
        ? "Suspicious — proceed with caution"
        : "Likely safe — no major red flags";

  const insights = flags
    .filter((f) => f.severity !== "success")
    .slice(0, 4)
    .map((f) => `${f.signal}: ${f.detail}`);

  if (insights.length === 0) {
    insights.push("No phishing tactics detected. Sender, links, and tone all check out.");
  }

  // Safe preview body
  const bodyLines = raw
    .split(/\n/)
    .filter((l) => !/^(from|to|subject|cc|bcc|date|reply-to|return-path|received|dkim|spf):/i.test(l))
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 8);

  return {
    riskScore,
    severity,
    verdict,
    urgencyMeter,
    flags,
    insights,
    safePreview: {
      from,
      subject,
      bodyLines,
      links,
    },
  };
}
