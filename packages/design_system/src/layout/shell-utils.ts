import type { DashboardId, DashboardInfo } from "../dashboards";
import { canOpen, type UserAccess } from "../lib/access";

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

/**
 * Without `access` (not signed in with metadata, or not loaded) every dashboard but admin is listed;
 * with it, only what the user can open, and always the current one.
 */
export function switcherItems(
  current: DashboardId,
  dashboards: DashboardInfo[],
  production = IS_PRODUCTION,
  access?: UserAccess | null,
): SwitcherItem[] {
  const visible = dashboards.filter((d) => {
    if (d.id === current) return true;
    return access ? canOpen(access, d.id) : d.id !== "admin";
  });
  return visible.map((d) => {
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
