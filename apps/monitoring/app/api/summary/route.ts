import { NextResponse } from "next/server";
import { fetchAllSites, fetchFacilityMinutes } from "@/lib/monitoring/client";
import { nationalSummary, offlineByHostGroup } from "@/lib/monitoring/aggregate";
import { getLastTwelveMonths } from "@/lib/monitoring/dates";
import type { HostType } from "@/lib/monitoring/types";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const range = getLastTwelveMonths();
    // Live: the cards show how many sites are offline now. The minutes query stays cached (history).
    const hosts = await fetchAllSites(fetch, { live: true });
    // The same per-site query feeds the maps (/api/provinces, /api/districts), so they share it.
    const byType = offlineByHostGroup(hosts, await fetchFacilityMinutes(hosts, range), h => h.type);
    const byCat: Record<HostType | "all", number> = {
      Disalab: byType.Disalab ?? 0, Disapoc: byType.Disapoc ?? 0, Disalink: byType.Disalink ?? 0, all: 0,
    };
    byCat.all = byCat.Disalab + byCat.Disapoc + byCat.Disalink;
    return NextResponse.json(nationalSummary(hosts, byCat, range));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
