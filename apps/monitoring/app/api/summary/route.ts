import { NextResponse } from "next/server";
import { fetchAllSites, fetchOfflineMinutesByFacility } from "@/lib/monitoring/client";
import { nationalSummary } from "@/lib/monitoring/aggregate";
import { getLastTwelveMonths } from "@/lib/monitoring/dates";
import type { HostType } from "@/lib/monitoring/types";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const range = getLastTwelveMonths();
    const hosts = await fetchAllSites();
    const types: HostType[] = ["Disalab", "Disapoc", "Disalink"];
    const byCat: Record<HostType | "all", number> = { all: 0, Disalab: 0, Disapoc: 0, Disalink: 0 };
    // Compute the three categories concurrently (each already parallelizes its chunks).
    await Promise.all(
      types.map(async (t) => {
        const names = hosts.filter(h => h.type === t).map(h => h.name).filter(Boolean) as string[];
        const stats = names.length ? await fetchOfflineMinutesByFacility(names, range) : [];
        byCat[t] = stats.reduce((a, s) => a + (s.amount_of_time || 0), 0);
      })
    );
    byCat.all = byCat.Disalab + byCat.Disapoc + byCat.Disalink;
    const summary = nationalSummary(hosts, byCat, range);
    return NextResponse.json(summary);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
