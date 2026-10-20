import { describe, expect, it } from "vitest";
import { maskName } from "./mask-name";

describe("maskName", () => {
  it("keeps the first and last letter of each word", () => {
    expect(maskName("RENILTON FRANCISCO")).toBe("R******N F******O");
  });

  it("short words keep their first letter", () => {
    expect(maskName("ANA DA SILVA")).toBe("A******A D* S******A");
    expect(maskName("A")).toBe("A");
  });

  it("collapses extra spaces and handles accents", () => {
    expect(maskName("  JOÃO   CÂNDIDO ")).toBe("J******O C******O");
  });

  it("empty for a missing name", () => {
    expect(maskName(null)).toBe("");
    expect(maskName("")).toBe("");
  });
});
