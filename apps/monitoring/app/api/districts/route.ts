import { NextResponse } from "next/server";
import { fetchAllSites, fetchFacilityMinutes } from "@/lib/monitoring/client";
import { offlineByHostGroup, regionUptime } from "@/lib/monitoring/aggregate";
import { getLastTwelveMonths } from "@/lib/monitoring/dates";
import { canonicalDistrict, normalizeProvince } from "@/lib/monitoring/regions";
import type { Host } from "@/lib/monitoring/types";

export const dynamic = "force-dynamic";
/** Uptime per district of `?province=<map key>` (spelling variants merged), from the shared per-site query. */
export async function GET(req: Request) {
  try {
    const province = normalizeProvince(new URL(req.url).searchParams.get("province"));
    if (!province) return NextResponse.json({ error: "província em falta ou desconhecida" }, { status: 400 });
    const range = getLastTwelveMonths();
    const all = await fetchAllSites();
    // Ask for every site (not just this province's), so the query is the one the summary already ran.
    const minutes = await fetchFacilityMinutes(all, range);
    const hosts = all.filter(h => normalizeProvince(h.ProvinceName) === province);
    const keyOf = (h: Host) => canonicalDistrict(province, h.DistrictName);
    return NextResponse.json(regionUptime(hosts, keyOf, offlineByHostGroup(hosts, minutes, keyOf), range));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
