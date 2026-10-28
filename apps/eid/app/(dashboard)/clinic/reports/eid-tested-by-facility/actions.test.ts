import { describe, expect, it } from "vitest";
import { ENDPOINT, PATIENT_PARAMS, TITLE } from "./constants";

describe("eid-tested-by-facility", () => {
  it("uses its endpoint and title", () => {
    expect(ENDPOINT).toBe("/facilities/tested_samples/");
    expect(TITLE).toBe("Amostras Testadas/Província");
  });
  it("patient params per ruling C4", () => {
    expect(PATIENT_PARAMS).toEqual({ date_basis: "analysis" });
  });
});
