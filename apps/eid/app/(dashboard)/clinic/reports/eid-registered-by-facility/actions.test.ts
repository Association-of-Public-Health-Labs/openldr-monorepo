import { describe, expect, it } from "vitest";
import { ENDPOINT, PATIENT_PARAMS, TITLE } from "./constants";

describe("eid-registered-by-facility", () => {
  it("uses its endpoint and title", () => {
    expect(ENDPOINT).toBe("/facilities/registered_samples/");
    expect(TITLE).toBe("Amostras Registadas/Província");
  });
  it("patient params per ruling C4", () => {
    expect(PATIENT_PARAMS).toEqual({});
  });
});
