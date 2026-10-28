export { interpretProbe } from "@repo/design_system/lib/report/admin-probe";

/** Path probed to learn the role: Admin-only, and the API checks the role before validating params. */
export const ADMIN_PROBE_PATH = "/hiv/vl/patients/by_facility/";
