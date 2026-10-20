export type AdminStatus = "unknown" | "admin" | "user";

/** Path probed to learn the role: Admin-only, and the API checks the role before validating params. */
export const ADMIN_PROBE_PATH = "/hiv/vl/patients/by_facility/";

/** 200/400 = admin; 401/403 = user; network failure or 5xx is inconclusive ("unknown") so the caller can retry. */
export function interpretProbe(status: number | null): AdminStatus {
  if (status === null || status >= 500) return "unknown";
  if (status === 200 || status === 400) return "admin";
  return "user";
}
