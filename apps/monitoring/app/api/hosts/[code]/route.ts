import { NextResponse } from "next/server";
import { fetchAllSites, fetchHistoryByFacility } from "@/lib/monitoring/client";
import { buildHeatmap } from "@/lib/monitoring/heatmap";
import { getLastTwelveMonths } from "@/lib/monitoring/dates";
import type { HostDetail } from "@/lib/monitoring/types";

export const revalidate = 120;
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await ctx.params;
    const range = getLastTwelveMonths();
    const hosts = await fetchAllSites();
    const host = hosts.find(h => h.code === code);
    if (!host) return NextResponse.json({ error: "Host não encontrado" }, { status: 404 });
    const logs = host.name ? await fetchHistoryByFacility([host.name], range, 1, 1000) : [];
    const heatmap = buildHeatmap(logs, range, host.created_at);
    const avgUptime = heatmap.length ? Math.round(heatmap.reduce((a, c) => a + c.uptime, 0) / heatmap.length) : 100;
    const lastEnded = logs.filter(l => l.end_date).map(l => new Date(l.end_date as string).getTime()).sort((a, b) => b - a)[0];
    const onlineSinceHours = host.status === "Online"
      ? Math.round((Date.now() - (lastEnded ?? new Date(host.updated_at).getTime())) / 3_600_000) : null;
    const detail: HostDetail = { host, uptimePct: avgUptime, downtimePct: 100 - avgUptime, onlineSinceHours, heatmap };
    return NextResponse.json(detail);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
