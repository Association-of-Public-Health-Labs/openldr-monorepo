import { NextResponse } from "next/server";
import { fetchAllSites } from "@/lib/monitoring/client";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return NextResponse.json({ hosts: await fetchAllSites(fetch, { live: true }) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
