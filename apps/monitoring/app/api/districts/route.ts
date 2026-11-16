import { NextResponse } from "next/server";
import { fetchAllSites, fetchOfflineMinutesByDistrict } from "@/lib/monitoring/client";
import { offlineByKey, regionUptime } from "@/lib/monitoring/aggregate";
import { getLastTwelveMonths } from "@/lib/monitoring/dates";
import { canonicalDistrict, normalizeProvince } from "@/lib/monitoring/regions";

export const revalidate = 120;
/** Uptime per district of `?province=<map key>`, one row per district (spelling variants merged). */
export async function GET(req: Request) {
  try {
    const province = normalizeProvince(new URL(req.url).searchParams.get("province"));
    if (!province) return NextResponse.json({ error: "província em falta ou desconhecida" }, { status: 400 });
    const range = getLastTwelveMonths();
    const hosts = (await fetchAllSites()).filter(h => normalizeProvince(h.ProvinceName) === province);
    const names = [...new Set(hosts.map(h => h.DistrictName?.trim()).filter(Boolean) as string[])];
    const stats = names.length ? await fetchOfflineMinutesByDistrict(names, range) : [];
    const keyOf = (name: string | null) => canonicalDistrict(province, name);
    const byRegion = offlineByKey(stats, "district", keyOf);
    return NextResponse.json(regionUptime(hosts, h => keyOf(h.DistrictName), byRegion, range));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
