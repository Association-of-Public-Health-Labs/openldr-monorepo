import { describe, expect, it } from "vitest";
import { ENDPOINT, TITLE } from "./constants";

describe("eid-tested-by-month", () => {
  it("uses its endpoint and title", () => {
    expect(ENDPOINT).toBe("/facilities/tested_samples_by_month/");
    expect(TITLE).toBe("Amostras Testadas/Mês");
  });
});
