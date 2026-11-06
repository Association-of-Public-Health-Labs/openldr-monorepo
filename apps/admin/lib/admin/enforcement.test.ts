import { describe, expect, it } from "vitest";
import { NOT_ENFORCED_NOTICE, permissionsEnforced } from "./enforcement";

describe("permissionsEnforced", () => {
  it("is true only for the exact value 1", () => {
    expect(permissionsEnforced("1")).toBe(true);
    for (const v of [undefined, "", "0", "true", " 1", "yes"]) expect(permissionsEnforced(v)).toBe(false);
  });
  it("has the Portuguese notice text", () => {
    expect(NOT_ENFORCED_NOTICE).toMatch(/^As permissões ainda não estão a ser aplicadas\./);
  });
});
