import type { DashboardId, DashboardInfo } from "../dashboards";

export const EMBLEM_URL = "https://res.cloudinary.com/dduwau07t/image/upload/v1658937655/emblem_fwcqku.png";
export const SIDEBAR_WIDTH = "300px";
export const SIDEBAR_WIDTH_ICON = "88px";

export interface SwitcherItem {
  id: DashboardId;
  name: string;
  primary: string;
  current: boolean;
  href?: string;
}

/** shadcn's SidebarProvider writes `sidebar_state`; collapsed unless it says true. */
export function readSidebarOpen(cookie: string): boolean {
  return cookie.split(";").some((part) => part.trim() === "sidebar_state=true");
}

export function switcherItems(current: DashboardId, dashboards: DashboardInfo[]): SwitcherItem[] {
  return dashboards.map((d) => ({
    id: d.id,
    name: d.name,
    primary: d.primary,
    current: d.id === current,
    href: d.id === current ? undefined : d.url,
  }));
}

export function headerTitle(portalTitle: string, pageTitle?: string): string {
  return pageTitle ? `${portalTitle} - ${pageTitle}` : portalTitle;
}

export function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}
