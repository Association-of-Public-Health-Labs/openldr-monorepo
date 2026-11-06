export { interpretProbe } from "@repo/design_system/lib/report/admin-probe";

/**
 * Path probed to learn the role. Called with no name: the API checks patient access first (403 without
 * it), then answers 400 for the missing name, so no patient row is read and none is logged.
 */
export const EID_ADMIN_PROBE_PATH = "/hiv/eid/patients/by_name/";
