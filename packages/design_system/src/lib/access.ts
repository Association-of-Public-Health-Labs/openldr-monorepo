import { DASHBOARDS, type DashboardId } from "../dashboards";

/** What a user may open, from Clerk `publicMetadata`. No Clerk or React imports: safe in middleware. */
export interface UserAccess {
  dashboards: DashboardId[];
  patientData: boolean;
  admin: boolean;
}

const KNOWN_IDS: readonly string[] = DASHBOARDS.map((d) => d.id);

/** `null` when the value is absent or malformed; unknown dashboard ids are dropped. */
export function parseAccess(value: unknown): UserAccess | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const { dashboards, patientData, admin } = value as Record<string, unknown>;
  if (!Array.isArray(dashboards) || typeof patientData !== "boolean" || typeof admin !== "boolean") return null;
  return {
    dashboards: dashboards.filter((id): id is DashboardId => typeof id === "string" && KNOWN_IDS.includes(id)),
    patientData,
    admin,
  };
}

export function canOpen(access: UserAccess | null, id: DashboardId): boolean {
  if (!access) return false;
  return id === "admin" ? access.admin : access.dashboards.includes(id);
}

export const NO_ACCESS_PATH = "/sem-acesso";

/**
 * Where to send a signed-in user who requested `pathname` of dashboard `id`: `null` lets them through.
 * `/sem-acesso` is never redirected, so there is no loop.
 */
export function accessRedirect(
  id: DashboardId,
  pathname: string,
  access: UserAccess | null,
): typeof NO_ACCESS_PATH | null {
  if (pathname === NO_ACCESS_PATH) return null;
  return canOpen(access, id) ? null : NO_ACCESS_PATH;
}
