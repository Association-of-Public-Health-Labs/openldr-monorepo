import { describe, expect, it } from "vitest";
import { accessRedirect, canOpen, parseAccess, type UserAccess } from "./access";

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

describe("accessRedirect", () => {
  const access: UserAccess = { dashboards: ["tb"], patientData: false, admin: false };
  it("lets through a user with the dashboard", () => {
    expect(accessRedirect("tb", "/", access)).toBeNull();
    expect(accessRedirect("tb", "/api/x", access)).toBeNull();
  });
  it("redirects a user without the dashboard", () => {
    expect(accessRedirect("vl", "/", access)).toBe("/sem-acesso");
  });
  it("redirects when access is null", () => {
    expect(accessRedirect("tb", "/", null)).toBe("/sem-acesso");
  });
  it("never redirects /sem-acesso itself", () => {
    expect(accessRedirect("vl", "/sem-acesso", access)).toBeNull();
    expect(accessRedirect("vl", "/sem-acesso", null)).toBeNull();
  });
  it("follows access.admin for admin", () => {
    expect(accessRedirect("admin", "/", access)).toBe("/sem-acesso");
    expect(accessRedirect("admin", "/", { ...access, admin: true })).toBeNull();
    expect(accessRedirect("admin", "/", { ...access, dashboards: ["admin"] })).toBe("/sem-acesso");
  });
});
