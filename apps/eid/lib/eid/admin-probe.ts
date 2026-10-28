export { interpretProbe } from "@repo/design_system/lib/report/admin-probe";

/** Path probed to learn the role: Admin-only, and the API checks the role before validating params. */
export const EID_ADMIN_PROBE_PATH = "/hiv/eid/patients/by_facility/";
