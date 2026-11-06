import { describe, expect, it } from "vitest";
import { gateRedirect } from "./access-gate";

const admin = { dashboards: [], patientData: false, admin: true };
const notAdmin = { dashboards: ["vl" as const], patientData: true, admin: false };

describe("gateRedirect", () => {
  it("lets an admin through", () => {
    expect(gateRedirect("/", admin)).toBeNull();
    expect(gateRedirect("/users", admin)).toBeNull();
  });
  it("sends a non-admin to /sem-acesso", () => {
    expect(gateRedirect("/", notAdmin)).toBe("/sem-acesso");
    expect(gateRedirect("/users", notAdmin)).toBe("/sem-acesso");
  });
  it("sends a user without access metadata to /sem-acesso", () => {
    expect(gateRedirect("/", null)).toBe("/sem-acesso");
  });
  it("does not redirect /sem-acesso itself, so there is no loop", () => {
    expect(gateRedirect("/sem-acesso", notAdmin)).toBeNull();
    expect(gateRedirect("/sem-acesso", null)).toBeNull();
    expect(gateRedirect("/sem-acesso", admin)).toBeNull();
  });
});
