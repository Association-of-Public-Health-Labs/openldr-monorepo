import { describe, expect, it } from "vitest";
import { categoryParams, DEFAULT_CATEGORY, titleFor } from "./tat-segment";

describe("tat-segment", () => {
  it("sends no category for the default segment", () => {
    expect(DEFAULT_CATEGORY).toBe(0);
    expect(categoryParams(0)).toEqual({});
    expect("category" in categoryParams(0)).toBe(false);
  });
  it("sends category for another segment", () => {
    expect(categoryParams(3)).toEqual({ category: 3 });
  });
  it("titles with the segment label, falling back to segment 0", () => {
    expect(titleFor(4)).toBe("TRL - Registo à Análise");
    expect(titleFor(0)).toBe("TRL - Colheita na US a Recepção no Hub");
    expect(titleFor(9)).toBe("TRL - Colheita na US a Recepção no Hub");
  });
});
