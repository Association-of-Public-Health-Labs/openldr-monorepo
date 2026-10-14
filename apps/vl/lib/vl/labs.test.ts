import { describe, expect, it } from "vitest";
import { LAB_GROUPS, labCodes, labParams } from "./labs";

describe("lab groups", () => {
  it("has the 16 legacy groups", () => {
    expect(LAB_GROUPS).toHaveLength(16);
  });
  it("flattens selected group names into lab codes", () => {
    expect(labCodes(["Jose Macamo", "INS"])).toEqual(["PJC", "PJV", "PMB"]);
  });
  it("ignores unknown names and returns [] for no selection", () => {
    expect(labCodes(["Nope"])).toEqual([]);
    expect(labCodes([])).toEqual([]);
  });
});

describe("labParams", () => {
  it("sends the window and lab codes; empty codes are dropped later by cleanParams", () => {
    expect(labParams({ start: "2026-01-01", end: "2026-01-31" }, ["PJC", "PJV"])).toEqual({
      interval_dates: "2026-01-01,2026-01-31",
      lab_code: ["PJC", "PJV"],
    });
  });
});
