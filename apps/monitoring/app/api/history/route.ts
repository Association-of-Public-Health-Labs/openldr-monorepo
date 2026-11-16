import { NextResponse } from "next/server";
import { fetchAllSites, fetchHistoryByFacility } from "@/lib/monitoring/client";
import { offlineDurationMs, humanizeDuration } from "@/lib/monitoring/duration";
import { rangeFromSearchParams } from "@/lib/monitoring/dates";
import type { HistoryRow } from "@/lib/monitoring/types";

export const revalidate = 60;
export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;
    const code = sp.get("code"); const stateFilter = sp.get("status") ?? "Todos";
    const range = rangeFromSearchParams(sp);
    if (!code) return NextResponse.json({ error: "code em falta" }, { status: 400 });
    const host = (await fetchAllSites()).find(h => h.code === code);
    if (!host?.name) return NextResponse.json({ rows: [] });
    const logs = await fetchHistoryByFacility([host.name], range, 1, 1000);
    let rows: HistoryRow[] = logs.map(l => {
      const pending = !l.end_date;
      const ms = l.start_date ? offlineDurationMs(l.start_date, l.end_date) : null;
      return { id: l.id, state: pending ? "Pendente" : "Completo",
        wentOffline: l.start_date, wentOnline: l.end_date,
        offlineDurationMs: ms, offlineDurationLabel: ms != null ? humanizeDuration(ms) : "—",
        createdAt: l.created_at, updatedAt: l.updated_at };
    });
    if (stateFilter === "Pendentes") rows = rows.filter(r => r.state === "Pendente");
    if (stateFilter === "Completos") rows = rows.filter(r => r.state === "Completo");
    return NextResponse.json({ rows });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
