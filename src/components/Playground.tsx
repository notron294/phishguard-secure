import { useState } from "react";
import { Gamepad2, ShieldCheck, ShieldAlert, Check, X, Trophy, RotateCw } from "lucide-react";

interface MockEmail {
  id: string;
  from: string;
  subject: string;
  preview: string;
  body: string[];
  isPhishing: boolean;
  indicators: string[]; // what makes it phish (or what makes it legit)
}

const EMAILS: MockEmail[] = [
  {
    id: "1",
    from: "Apple Support <support@apple-id-verify.com>",
    subject: "URGENT: Your Apple ID has been suspended",
    preview: "Verify your account within 24 hours to avoid permanent termination…",
    body: [
      "Dear Customer,",
      "We detected unusual activity on your Apple ID. To prevent permanent suspension, you must verify your identity within 24 hours.",
      "Click here: http://apple-id-verify.com/login",
      "Failure to act will result in account termination.",
      "— Apple Support Team",
    ],
    isPhishing: true,
    indicators: [
      "Sender domain apple-id-verify.com is NOT apple.com",
      "Urgency tactic: '24 hours' deadline",
      "Generic greeting 'Dear Customer'",
      "Suspicious unbranded HTTP link (no HTTPS)",
    ],
  },
  {
    id: "2",
    from: "GitHub <noreply@github.com>",
    subject: "[GitHub] A new SSH key was added to your account",
    preview: "If you didn't add this key, you can remove it from your settings.",
    body: [
      "Hey octocat,",
      "A new SSH key was added to your GitHub account.",
      "Key fingerprint: SHA256:abcd1234…",
      "If you did not perform this action, please review your account at https://github.com/settings/keys",
      "Thanks, The GitHub Team",
    ],
    isPhishing: false,
    indicators: [
      "Legitimate sender domain github.com",
      "Personalized greeting using username",
      "HTTPS link to the real github.com domain",
      "Informational tone, no pressure tactics",
    ],
  },
  {
    id: "3",
    from: "DHL Express <tracking@dhl-delivery-update.top>",
    subject: "Package on hold — pay €2.99 to release",
    preview: "Your parcel is held at the depot. Pay a small customs fee…",
    body: [
      "Hello,",
      "Your DHL parcel #DHL-89421 is on hold pending a small customs fee of €2.99.",
      "Pay now to avoid return-to-sender: http://dhl-delivery-update.top/pay",
      "This link expires in 12 hours.",
    ],
    isPhishing: true,
    indicators: [
      "Suspicious TLD: .top",
      "Tiny payment amount (€2.99) is a known scam pattern",
      "Time-pressure tactic: 'expires in 12 hours'",
      "Domain dhl-delivery-update.top is not dhl.com",
    ],
  },
  {
    id: "4",
    from: "Stripe <receipts@stripe.com>",
    subject: "Your receipt from Acme Inc. — $29.00",
    preview: "Thanks for your payment. View your receipt online.",
    body: [
      "Hi Jane,",
      "You paid $29.00 to Acme Inc. on April 24, 2026.",
      "Receipt: https://pay.stripe.com/receipts/abcd",
      "Questions? Reply to this email or visit support.stripe.com.",
    ],
    isPhishing: false,
    indicators: [
      "Legitimate sender stripe.com",
      "Specific personalized details (name, amount, merchant)",
      "Link goes to a real Stripe subdomain",
      "No urgency or threats",
    ],
  },
];

type Choice = "safe" | "flag";
interface Answer {
  choice: Choice;
  correct: boolean;
}

export function Playground() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [feedback, setFeedback] = useState<Answer | null>(null);

  const email = EMAILS[idx];
  const total = EMAILS.length;
  const score = Object.values(answers).filter((a) => a.correct).length;
  const done = Object.keys(answers).length === total;

  const handleChoice = (choice: Choice) => {
    if (answers[email.id]) return;
    const correct = (choice === "flag") === email.isPhishing;
    const ans: Answer = { choice, correct };
    setAnswers((a) => ({ ...a, [email.id]: ans }));
    setFeedback(ans);
  };

  const next = () => {
    setFeedback(null);
    setIdx((i) => Math.min(i + 1, total - 1));
  };

  const reset = () => {
    setAnswers({});
    setFeedback(null);
    setIdx(0);
  };

  return (
    <section id="playground" className="border-t border-border px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <Gamepad2 className="mr-1 inline h-3 w-3 text-primary" />
              Phishing playground
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              Test your ability
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Read each mock email and decide: legitimate or phishing? Get instant feedback on the
              indicators you missed.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-border bg-surface/60 px-3 py-1.5 font-mono text-xs">
              <span className="text-muted-foreground">Score </span>
              <span className="text-foreground">{score}</span>
              <span className="text-muted-foreground">/{total}</span>
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-border-strong hover:text-foreground"
            >
              <RotateCw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Email card */}
          <div className="glass relative overflow-hidden rounded-2xl border border-border lg:col-span-3">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Sample {idx + 1} of {total}
                </span>
              </div>
              <div className="flex gap-1">
                {EMAILS.map((e, i) => {
                  const a = answers[e.id];
                  return (
                    <button
                      key={e.id}
                      onClick={() => {
                        setIdx(i);
                        setFeedback(answers[e.id] ?? null);
                      }}
                      aria-label={`Go to sample ${i + 1}`}
                      className={`h-1.5 w-6 rounded-full transition ${
                        i === idx
                          ? "bg-foreground"
                          : a
                            ? a.correct
                              ? "bg-success/70"
                              : "bg-critical/70"
                            : "bg-border"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 px-5 py-5">
              <Row label="From" value={email.from} mono />
              <Row label="Subject" value={email.subject} bold />
              <div className="border-t border-border pt-3 font-mono text-[13px] leading-relaxed text-foreground/90">
                {email.body.map((line, i) => (
                  <p key={i} className="mb-1.5">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex gap-2 border-t border-border bg-surface/40 px-5 py-3">
              <button
                onClick={() => handleChoice("safe")}
                disabled={!!answers[email.id]}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-4 py-2 text-xs font-medium text-success transition hover:bg-success/15 disabled:opacity-50"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Accept · looks safe
              </button>
              <button
                onClick={() => handleChoice("flag")}
                disabled={!!answers[email.id]}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-critical/30 bg-critical/10 px-4 py-2 text-xs font-medium text-critical transition hover:bg-critical/15 disabled:opacity-50"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Flag · phishing
              </button>
            </div>
          </div>

          {/* Feedback panel */}
          <div className="glass overflow-hidden rounded-2xl border border-border lg:col-span-2">
            {!feedback && !done && (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
                <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-foreground">Make your call</p>
                <p className="text-xs text-muted-foreground">
                  We'll show the indicators you spotted — and the ones you missed.
                </p>
              </div>
            )}

            {feedback && (
              <div className="fade-up flex h-full flex-col">
                <div
                  className={`flex items-center gap-2 border-b px-5 py-3 ${
                    feedback.correct
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-critical/30 bg-critical/10 text-critical"
                  }`}
                >
                  {feedback.correct ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {feedback.correct ? "Nice catch" : "Got fooled"}
                  </span>
                  <span className="ml-auto rounded-full bg-background/40 px-2 py-0.5 font-mono text-[10px]">
                    {email.isPhishing ? "Phishing" : "Legitimate"}
                  </span>
                </div>

                <div className="flex-1 space-y-3 px-5 py-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {email.isPhishing ? "Red flags in this email" : "Why this is legitimate"}
                  </p>
                  <ul className="space-y-2">
                    {email.indicators.map((ind, i) => (
                      <li key={i} className="flex gap-2 text-xs text-foreground/90">
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                            email.isPhishing ? "bg-critical" : "bg-success"
                          }`}
                        />
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-border px-5 py-3">
                  {idx < total - 1 ? (
                    <button
                      onClick={next}
                      className="w-full rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition hover:opacity-90"
                    >
                      Next sample →
                    </button>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <Trophy className="h-3.5 w-3.5 text-warning" />
                        <span className="text-muted-foreground">Final</span>
                        <span className="font-mono text-foreground">
                          {score}/{total}
                        </span>
                      </div>
                      <button
                        onClick={reset}
                        className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition hover:opacity-90"
                      >
                        Play again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  mono,
  bold,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex gap-3 text-xs">
      <span className="w-16 flex-shrink-0 text-muted-foreground">{label}</span>
      <span
        className={`flex-1 break-all ${mono ? "font-mono" : ""} ${
          bold ? "font-semibold text-foreground" : "text-foreground/90"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
