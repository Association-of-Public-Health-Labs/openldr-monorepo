import { NextResponse } from "next/server";
import { fetchAllSites, fetchFacilityMinutes } from "@/lib/monitoring/client";
import { offlineByHostGroup, regionUptime } from "@/lib/monitoring/aggregate";
import { getLastTwelveMonths } from "@/lib/monitoring/dates";
import { normalizeProvince } from "@/lib/monitoring/regions";
import type { Host } from "@/lib/monitoring/types";

export const dynamic = "force-dynamic";
/** Uptime per province, keyed by the shared map's province names, from the per-site query /api/summary also uses. */
export async function GET() {
  try {
    const range = getLastTwelveMonths();
    const hosts = await fetchAllSites();
    const keyOf = (h: Host) => normalizeProvince(h.ProvinceName);
    const byRegion = offlineByHostGroup(hosts, await fetchFacilityMinutes(hosts, range), keyOf);
    return NextResponse.json(regionUptime(hosts, keyOf, byRegion, range));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
