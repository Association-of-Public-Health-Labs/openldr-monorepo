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
