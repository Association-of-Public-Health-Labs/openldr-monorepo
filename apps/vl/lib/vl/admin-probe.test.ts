import { describe, expect, it } from "vitest";
import { interpretProbe } from "./admin-probe";

describe("interpretProbe", () => {
  it("treats 403 as a regular user", () => {
    expect(interpretProbe(403)).toBe("user");
  });
  it("treats 400 and 200 as admin (role checked before validation)", () => {
    expect(interpretProbe(400)).toBe("admin");
    expect(interpretProbe(200)).toBe("admin");
  });
  it("treats 401 as a regular user", () => {
    expect(interpretProbe(401)).toBe("user");
  });
  it("treats 5xx and network failure as inconclusive", () => {
    expect(interpretProbe(500)).toBe("unknown");
    expect(interpretProbe(503)).toBe("unknown");
    expect(interpretProbe(null)).toBe("unknown");
  });
});
