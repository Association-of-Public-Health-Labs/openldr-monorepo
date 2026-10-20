import { describe, expect, it } from "vitest";
import { LAB_GROUPS, labCodes, labParams, withLab } from "./labs";

describe("withLab", () => {
  it("drops rows with no lab (the API can return testing_facility null)", () => {
    const rows = [
      { testing_facility: null, total: 5 },
      { testing_facility: "Lab A", total: 7 },
      { testing_facility: "", total: 1 },
    ];
    expect(withLab(rows)).toEqual([{ testing_facility: "Lab A", total: 7 }]);
  });
  it("keeps every row when all have a lab", () => {
    const rows = [{ testing_facility: "A" }, { testing_facility: "B" }];
    expect(withLab(rows)).toEqual(rows);
  });
});

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
