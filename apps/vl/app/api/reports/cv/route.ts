import { NextResponse } from "next/server";
import { listWeeklyReports, NextcloudNotConfigured } from "@repo/design_system/lib/report/nextcloud-server";

// Signed-in users only: the Clerk middleware protects /api. Never prerendered or cached by Next.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // `||`, not `??`: an empty NEXTCLOUD_CV_FOLDER falls back to the default, as before the move to the kit.
    return NextResponse.json(await listWeeklyReports(process.env.NEXTCLOUD_CV_FOLDER || "/reports/CV"));
  } catch (error) {
    if (error instanceof NextcloudNotConfigured) {
      return NextResponse.json({ error: "Os relatórios semanais não estão configurados neste servidor." }, { status: 503 });
    }
    console.error("Failed to list the weekly CV reports:", error);
    return NextResponse.json({ error: "Não foi possível obter os relatórios semanais." }, { status: 502 });
  }
}
