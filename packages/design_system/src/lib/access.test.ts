import { describe, expect, it } from "vitest";
import { canOpen, parseAccess, type UserAccess } from "./access";

describe("parseAccess", () => {
  it("reads a valid value", () => {
    expect(parseAccess({ dashboards: ["tb", "vl"], patientData: true, admin: false })).toEqual({
      dashboards: ["tb", "vl"],
      patientData: true,
      admin: false,
    });
  });
  it("returns null when absent", () => {
    expect(parseAccess(undefined)).toBeNull();
    expect(parseAccess(null)).toBeNull();
  });
  it("returns null when malformed", () => {
    expect(parseAccess("tb")).toBeNull();
    expect(parseAccess([])).toBeNull();
    expect(parseAccess({ dashboards: "tb", patientData: true, admin: false })).toBeNull();
    expect(parseAccess({ dashboards: ["tb"], patientData: "yes", admin: false })).toBeNull();
    expect(parseAccess({ dashboards: ["tb"], patientData: true })).toBeNull();
  });
  it("drops unknown dashboard ids", () => {
    expect(parseAccess({ dashboards: ["tb", "cd4", 7], patientData: false, admin: false })?.dashboards).toEqual(["tb"]);
  });
});

describe("canOpen", () => {
  const access: UserAccess = { dashboards: ["tb"], patientData: false, admin: false };
  it("is false without access", () => {
    expect(canOpen(null, "tb")).toBe(false);
  });
  it("needs the id in dashboards", () => {
    expect(canOpen(access, "tb")).toBe(true);
    expect(canOpen(access, "vl")).toBe(false);
  });
  it("needs admin for the admin dashboard", () => {
    expect(canOpen(access, "admin")).toBe(false);
    expect(canOpen({ ...access, dashboards: ["admin"] }, "admin")).toBe(false);
    expect(canOpen({ ...access, admin: true }, "admin")).toBe(true);
  });
});
