import { Inbox } from "lucide-react";

export function EmptyDashboard() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/40 p-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-muted-foreground">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold">No scan yet</h3>
      <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
        Drop an .eml file or paste raw headers above to populate the dashboard.
      </p>
    </div>
  );
}
