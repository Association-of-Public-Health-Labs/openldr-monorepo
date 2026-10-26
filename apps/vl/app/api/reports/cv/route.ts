import { NextResponse } from "next/server";
import { listCvReports, NextcloudNotConfigured } from "@/lib/vl/reports/server";

// Signed-in users only: the Clerk middleware protects /api. Never prerendered or cached by Next.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await listCvReports());
  } catch (error) {
    if (error instanceof NextcloudNotConfigured) {
      return NextResponse.json({ error: "Os relatórios semanais não estão configurados neste servidor." }, { status: 503 });
    }
    console.error("Failed to list the weekly CV reports:", error);
    return NextResponse.json({ error: "Não foi possível obter os relatórios do Nextcloud." }, { status: 502 });
  }
}
