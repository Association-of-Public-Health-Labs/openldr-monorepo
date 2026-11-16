import { NextResponse } from "next/server";
import { fetchAllSites, fetchOfflineMinutesByProvince } from "@/lib/monitoring/client";
import { offlineByKey, regionUptime } from "@/lib/monitoring/aggregate";
import { getLastTwelveMonths } from "@/lib/monitoring/dates";
import { normalizeProvince } from "@/lib/monitoring/regions";

export const dynamic = "force-dynamic";
/** Uptime per province, keyed by the shared map's province names. */
export async function GET() {
  try {
    const range = getLastTwelveMonths();
    const hosts = await fetchAllSites();
    // DisaStatus filters by its own spellings, so ask for every raw name and merge afterwards.
    const names = [...new Set(hosts.map(h => h.ProvinceName?.trim()).filter(Boolean) as string[])];
    const stats = await fetchOfflineMinutesByProvince(names, range);
    const byRegion = offlineByKey(stats, "province", normalizeProvince);
    return NextResponse.json(regionUptime(hosts, h => normalizeProvince(h.ProvinceName), byRegion, range));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
