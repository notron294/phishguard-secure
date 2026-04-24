// ─── Phishing Map — Data Hook ─────────────────────────────────────────────────
// usePhishingData handles fetching, polling, and deriving map primitives.

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  PhishingCampaign,
  CampaignTarget,
  AttackArc,
  MapMarker,
  MapStats,
} from "@/types/phishingMap.types";
import { fetchMockCampaigns } from "@/data/mockCampaigns";

interface UsePhishingDataOptions {
  pollIntervalMs?: number;
  fetchFn?: () => Promise<PhishingCampaign[]>;
}

interface UsePhishingDataReturn {
  campaigns: PhishingCampaign[];
  arcs: AttackArc[];
  markers: MapMarker[];
  stats: MapStats;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function usePhishingData({
  pollIntervalMs = 30_000,
  fetchFn = fetchMockCampaigns,
}: UsePhishingDataOptions = {}): UsePhishingDataReturn {
  const [campaigns, setCampaigns] = useState<PhishingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isMounted = useRef(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchFn();
      if (!isMounted.current) return;
      setCampaigns(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (!isMounted.current) return;
      setError(err instanceof Error ? err.message : "Failed to load campaign data");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [fetchFn]);

  // Initial load + polling
  useEffect(() => {
    isMounted.current = true;
    load();

    if (pollIntervalMs > 0) {
      const interval = setInterval(load, pollIntervalMs);
      return () => {
        isMounted.current = false;
        clearInterval(interval);
      };
    }

    return () => { isMounted.current = false; };
  }, [load, pollIntervalMs]);

  // Derive attack arcs from campaign data
  const arcs = useMemo<AttackArc[]>(() =>
    campaigns.flatMap((c) =>
      c.targets.map((t: CampaignTarget, i: number) => ({
        id: `${c.id}-arc-${i}`,
        campaignId: c.id,
        source: c.sourceCoords,
        target: t.coords,
        type: c.type,
        severity: c.severity,
        volume: t.hits,
      }))
    ),
    [campaigns]
  );

  // Derive map markers
  const markers = useMemo<MapMarker[]>(() => {
    const seen = new Set<string>();
    const result: MapMarker[] = [];

    campaigns.forEach((c) => {
      const srcKey = `src-${c.sourceCountry}`;
      if (!seen.has(srcKey)) {
        seen.add(srcKey);
        result.push({
          id: srcKey,
          coords: c.sourceCoords,
          label: `${c.sourceCountry} — ${c.actor ?? "Unknown actor"}`,
          type: "source",
          severity: c.severity,
          campaignId: c.id,
        });
      }

      c.targets.forEach((t: CampaignTarget, i: number) => {
        const tgtKey = `tgt-${c.id}-${i}`;
        result.push({
          id: tgtKey,
          coords: t.coords,
          label: t.country,
          type: "target",
          severity: c.severity,
          campaignId: c.id,
        });
      });
    });

    return result;
  }, [campaigns]);

  // Derive sidebar stats
  const stats = useMemo<MapStats>(() => {
    const active = campaigns.filter((c) => c.active);

    const sourceCount: Record<string, number> = {};
    const targetCount: Record<string, number> = {};

    campaigns.forEach((c) => {
      sourceCount[c.sourceCountry] = (sourceCount[c.sourceCountry] ?? 0) + c.volume;
      c.targets.forEach((t: CampaignTarget) => {
        targetCount[t.country] = (targetCount[t.country] ?? 0) + t.hits;
      });
    });

    const topSource = Object.entries(sourceCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const topTarget = Object.entries(targetCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: active.length,
      totalEmailsDetected: campaigns.reduce((s, c) => s + c.volume, 0),
      totalBlocked: campaigns.reduce((s, c) => s + c.blocked, 0),
      topSourceCountry: topSource,
      topTargetCountry: topTarget,
      criticalCount: campaigns.filter((c) => c.severity === "critical").length,
    };
  }, [campaigns]);

  return { campaigns, arcs, markers, stats, loading, error, lastUpdated, refresh: load };
}
