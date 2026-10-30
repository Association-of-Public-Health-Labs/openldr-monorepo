import { describe, expect, it } from "vitest";
import { DEFAULT_GENDER_TAB, genderExtraParams, genderPatientParams, genderTitle } from "./gender-tabs";

describe("gender tabs", () => {
  it("defaults to Todos, which sends no lab_type (a {} , never {lab_type: undefined})", () => {
    expect(DEFAULT_GENDER_TAB).toBe("all");
    expect(genderExtraParams("all")).toEqual({});
    expect(Object.keys(genderExtraParams("all"))).toHaveLength(0);
    expect(genderExtraParams("poc")).toEqual({ lab_type: "poc" });
    expect(genderExtraParams("conventional")).toEqual({ lab_type: "conventional" });
  });
  it("title suffix", () => {
    expect(genderTitle("Amostras Testadas por Sexo/Província", "poc")).toBe("Amostras Testadas por Sexo/Província - PoC");
    expect(genderTitle("X", "all")).toBe("X - Todos");
    expect(genderTitle("X", "conventional")).toBe("X - Convencional");
  });
  it("test_gender_patient_params_follow_tab", () => {
    expect(genderPatientParams("all")).toEqual({ date_basis: "analysis" });
    expect(genderPatientParams("poc")).toEqual({ date_basis: "analysis", lab_type: "poc" });
    expect(genderPatientParams("conventional")).toEqual({ date_basis: "analysis", lab_type: "conventional" });
  });
});
