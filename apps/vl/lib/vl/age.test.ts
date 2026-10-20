import { describe, expect, it } from "vitest";
import { ageRangeParam, DEFAULT_AGE_RANGE, parseAgeRange } from "./age";

describe("age range", () => {
  it("defaults to 15-49", () => {
    expect(DEFAULT_AGE_RANGE).toEqual([15, 49]);
    expect(ageRangeParam(DEFAULT_AGE_RANGE)).toBe("15,49");
  });
  it("accepts valid integer ranges", () => {
    expect(parseAgeRange(" 0 ", "14")).toEqual([0, 14]);
  });
  it("rejects blanks, decimals, negatives, inverted ranges and >120", () => {
    expect(parseAgeRange("", "49")).toBe("Indique idades inteiras.");
    expect(parseAgeRange("1.5", "49")).toBe("Indique idades inteiras.");
    expect(parseAgeRange("-1", "49")).toBe("As idades devem estar entre 0 e 120.");
    expect(parseAgeRange("10", "130")).toBe("As idades devem estar entre 0 e 120.");
    expect(parseAgeRange("50", "49")).toBe("A idade inicial não pode ser maior que a final.");
  });
});
