import { NextResponse } from "next/server";
import { fetchAllSites, fetchHistoryByFacility } from "@/lib/monitoring/client";
import { buildHeatmap } from "@/lib/monitoring/heatmap";
import { realTime } from "@/lib/monitoring/host-labels";
import { getLastTwelveMonths } from "@/lib/monitoring/dates";
import type { HostDetail } from "@/lib/monitoring/types";

// The header shows the site's status now, so the site list is read live; its history stays cached.
export const dynamic = "force-dynamic";
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await ctx.params;
    const range = getLastTwelveMonths();
    const hosts = await fetchAllSites(fetch, { live: true });
    const host = hosts.find(h => h.code === code);
    if (!host) return NextResponse.json({ error: "Host não encontrado" }, { status: 404 });
    const logs = host.name ? await fetchHistoryByFacility([host.name], range, 1, 1000) : [];
    const heatmap = buildHeatmap(logs, range, host.created_at);
    const avgUptime = heatmap.length ? Math.round(heatmap.reduce((a, c) => a + c.uptime, 0) / heatmap.length) : 100;
    // Online since the last outage ended (DisaStatus stores times 2 h behind, hence realTime). With no
    // outage in the 12 months there is no start to count from, so the header just says "Online".
    const lastEnded = Math.max(...logs.map(l => realTime(l.end_date)).filter(t => !Number.isNaN(t)));
    const onlineSinceHours = host.status === "Online" && Number.isFinite(lastEnded)
      ? Math.max(0, Math.floor((Date.now() - lastEnded) / 3_600_000)) : null;
    const detail: HostDetail = { host, uptimePct: avgUptime, downtimePct: 100 - avgUptime, onlineSinceHours, heatmap };
    return NextResponse.json(detail);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
