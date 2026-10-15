import { getDashboard, type DashboardId } from "../dashboards";

// Shared series palette (from design_system_mui themes/charts.ts theme1), minus the dashboard primaries.
const PALETTE = ["#009689", "#104e64", "#6B52DC", "#008FFB", "#FF4560", "#775DD0", "#2E294E", "#E2C044", "#00E396"];

/** 8 series colours for a dashboard, starting with its primary. Wired into charts in wave 2c. */
export function chartColors(dashboard: DashboardId): string[] {
  const { primary } = getDashboard(dashboard, {});
  const rest = PALETTE.filter((c) => c.toLowerCase() !== primary.toLowerCase());
  return [primary, ...rest].slice(0, 8);
}
