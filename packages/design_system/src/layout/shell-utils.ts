import type { DashboardId, DashboardInfo } from "../dashboards";

export const EMBLEM_URL = "https://res.cloudinary.com/dduwau07t/image/upload/v1658937655/emblem_fwcqku.png";

export interface SwitcherItem {
  id: DashboardId;
  name: string;
  primary: string;
  current: boolean;
  /** Not ready for production: shown, but not a link. */
  disabled: boolean;
  href?: string;
}

// `next build` (every deployment) is production; `next dev` keeps unreleased dashboards reachable.
const IS_PRODUCTION = process.env.NODE_ENV === "production";

export function switcherItems(current: DashboardId, dashboards: DashboardInfo[], production = IS_PRODUCTION): SwitcherItem[] {
  return dashboards.map((d) => {
    const isCurrent = d.id === current;
    const disabled = !isCurrent && production && !d.ready;
    return {
      id: d.id,
      name: d.name,
      primary: d.primary,
      current: isCurrent,
      disabled,
      href: isCurrent || disabled ? undefined : d.url,
    };
  });
}

export function headerTitle(portalTitle: string, pageTitle?: string): string {
  return pageTitle ? `${portalTitle} - ${pageTitle}` : portalTitle;
}

export function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}
