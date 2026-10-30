export type DashboardId = "vl" | "tb" | "eid";

export interface DashboardInfo {
  id: DashboardId;
  name: string;
  portalTitle: string;
  url: string;
  primary: string;
  primaryForeground: string;
  /** false: listed but not offered in production builds (switcher and account drawer show it as "Em breve"). */
  ready: boolean;
}

export type UrlOverrides = Partial<Record<DashboardId, string | undefined>>;

export const DASHBOARDS: readonly DashboardInfo[] = [
  {
    id: "vl",
    name: "Carga Viral",
    portalTitle: "Portal de Carga Viral",
    url: "https://vl.openldr.org.mz",
    primary: "#00B000",
    primaryForeground: "#FFFFFF",
    ready: true,
  },
  {
    id: "tb",
    name: "Tuberculose",
    portalTitle: "Portal de Testagem Laboratorial de TB",
    url: "https://tb.openldr.org.mz",
    primary: "#FF3030",
    primaryForeground: "#FFFFFF",
    ready: true,
  },
  {
    id: "eid",
    name: "Diagnóstico Precoce Infantil",
    portalTitle: "Portal de DPI",
    url: "https://eid.openldr.org.mz",
    primary: "#fda92d",
    // Dark text: white on #fda92d is 1.9:1, #1C252E is 8.1:1 (AA).
    primaryForeground: "#1C252E",
    ready: false,
  },
];

// Literal process.env reads so Next.js inlines them at build time.
const ENV_OVERRIDES: UrlOverrides = {
  vl: process.env.NEXT_PUBLIC_DASHBOARD_URL_VL,
  tb: process.env.NEXT_PUBLIC_DASHBOARD_URL_TB,
  eid: process.env.NEXT_PUBLIC_DASHBOARD_URL_EID,
};

export function resolveUrl(defaultUrl: string, override?: string): string {
  if (!override) return defaultUrl;
  try {
    const parsed = new URL(override);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return override.replace(/\/+$/, "");
    }
  } catch {
    // fall through to the warning
  }
  console.warn(`Ignoring invalid dashboard URL override "${override}"; using ${defaultUrl}`);
  return defaultUrl;
}

export function getDashboards(overrides: UrlOverrides = ENV_OVERRIDES): DashboardInfo[] {
  return DASHBOARDS.map((d) => ({ ...d, url: resolveUrl(d.url, overrides[d.id]) }));
}

export function getDashboard(id: DashboardId, overrides: UrlOverrides = ENV_OVERRIDES): DashboardInfo {
  const found = getDashboards(overrides).find((d) => d.id === id);
  if (!found) throw new Error(`Unknown dashboard: ${id}`);
  return found;
}
