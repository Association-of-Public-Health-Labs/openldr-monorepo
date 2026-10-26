import { describe, expect, it } from "vitest";
import { provinceKey } from "./geo";

describe("provinceKey", () => {
  it("maps API province names to InteractiveSvgMap keys", () => {
    expect(provinceKey("Maputo Cidade")).toBe("mc");
    expect(provinceKey("Maputo Provincia")).toBe("mp");
    expect(provinceKey("Cabo Delgado")).toBe("cd");
  });
  it("ignores accents, case and extra spaces", () => {
    expect(provinceKey("Zambézia")).toBe("zb");
    expect(provinceKey("  maputo   província ")).toBe("mp");
  });
  it("returns undefined for null and unknown names", () => {
    expect(provinceKey(null)).toBeUndefined();
    expect(provinceKey("null")).toBeUndefined();
    expect(provinceKey("Lisboa")).toBeUndefined();
  });
});
