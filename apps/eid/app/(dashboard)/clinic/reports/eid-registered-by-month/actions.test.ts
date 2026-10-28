import { describe, expect, it } from "vitest";
import { ENDPOINT, TITLE } from "./constants";

describe("eid-registered-by-month", () => {
  it("uses its endpoint and title", () => {
    expect(ENDPOINT).toBe("/facilities/registered_samples_by_month/");
    expect(TITLE).toBe("Amostras Registadas/Mês");
  });
});
