import { describe, expect, it } from "vitest";
import { LAB_GROUPS, labCodes } from "./labs";

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
