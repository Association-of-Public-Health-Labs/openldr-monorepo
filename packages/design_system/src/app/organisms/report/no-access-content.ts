import { getDashboards, type DashboardId } from "../../../dashboards";
import { canOpen, type UserAccess } from "../../../lib/access";
import { switcherItems } from "../../../layout/shell-utils";

export interface NoAccessLink {
  id: DashboardId;
  name: string;
  href: string;
}

export interface NoAccessContent {
  /** Set when the user can already open this dashboard (access granted after they landed here): the way back in. */
  open: NoAccessLink | null;
  /** Other dashboards the user can open. Empty when `access` is null. */
  others: NoAccessLink[];
}

export function noAccessContent(dashboard: DashboardId, access: UserAccess | null): NoAccessContent {
  if (!access) return { open: null, others: [] };
  const open = canOpen(access, dashboard)
    ? { id: dashboard, name: getDashboards().find((d) => d.id === dashboard)?.name ?? dashboard, href: "/" }
    : null;
  const others = switcherItems(dashboard, getDashboards(), undefined, access)
    .filter((i) => !i.current && i.href)
    .map((i) => ({ id: i.id, name: i.name, href: i.href as string }));
  return { open, others };
}
