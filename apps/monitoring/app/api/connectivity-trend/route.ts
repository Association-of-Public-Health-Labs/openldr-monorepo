import { NextResponse } from "next/server";
import { fetchConnectivityTrend } from "@/lib/monitoring/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const trend = await fetchConnectivityTrend();
    return NextResponse.json(trend);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
