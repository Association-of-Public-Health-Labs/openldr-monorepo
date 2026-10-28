import { describe, expect, it } from "vitest";
import { EID_ADMIN_PROBE_PATH, interpretProbe } from "./admin-probe";

describe("admin probe", () => {
  it("test_eid_probe_path", () => {
    expect(EID_ADMIN_PROBE_PATH).toBe("/hiv/eid/patients/by_facility/");
  });
  it("reads 200 as admin and 403 as not admin", () => {
    expect(interpretProbe(200)).toBe("admin");
    expect(interpretProbe(403)).toBe("user");
  });
});
