export type AdminStatus = "unknown" | "admin" | "user";

/** Path probed to learn the role: Admin-only, and the API checks the role before validating params. */
export const ADMIN_PROBE_PATH = "/hiv/vl/patients/by_facility/";

export function interpretProbe(status: number | null): "admin" | "user" {
  if (status === 200 || status === 400) return "admin";
  return "user";
}
