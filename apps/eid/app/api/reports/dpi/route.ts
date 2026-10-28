import { NextResponse } from "next/server";
import { listWeeklyReports, NextcloudNotConfigured } from "@repo/design_system/lib/report/nextcloud-server";

// Signed-in users only: the Clerk middleware protects /api. Never prerendered or cached by Next.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // `||`, not `??`: an empty NEXTCLOUD_DPI_FOLDER falls back to the default, as VL's route does.
    return NextResponse.json(await listWeeklyReports(process.env.NEXTCLOUD_DPI_FOLDER || "/reports/DPI"));
  } catch (error) {
    if (error instanceof NextcloudNotConfigured) {
      return NextResponse.json({ error: "Os relatórios semanais não estão configurados neste servidor." }, { status: 503 });
    }
    console.error("Failed to list the weekly DPI reports:", error);
    // The drawer shows this text: it never names the source.
    return NextResponse.json({ error: "Não foi possível obter os relatórios semanais." }, { status: 502 });
  }
}
