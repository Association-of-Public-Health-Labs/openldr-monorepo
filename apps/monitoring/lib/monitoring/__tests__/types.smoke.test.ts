import { describe, it, expect } from "vitest";
import type { Host } from "../types";
describe("types", () => {
  it("compiles a Host literal", () => {
    const h: Host = { id: 1, code: "X", name: "n", alias: null, teamviewer_id: "1",
      category: null, group_id: null, type: "Disalab", status: "Online",
      created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z",
      ProvinceName: "Tete", DistrictName: "Moatize" };
    expect(h.type).toBe("Disalab");
  });
});
