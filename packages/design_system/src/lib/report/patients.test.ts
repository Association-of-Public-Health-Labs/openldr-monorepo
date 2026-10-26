import { describe, expect, it } from "vitest";
import { patientCells, patientsSheet, text, type PatientColumn } from "./patients";

const columns: PatientColumn[] = [
  { key: "name", label: "Nome", format: text },
  { key: "age", label: "Idade" },
  { key: "sex", label: "Sexo", format: (v) => (v === "F" ? "Feminino" : text(v)) },
];

describe("patient columns", () => {
  it("formats cells in column order and keeps raw numbers", () => {
    expect(patientCells(columns, { name: "Ana", age: 34, sex: "F" })).toEqual(["Ana", 34, "Feminino"]);
  });
  it("missing values: formatted columns give their text, raw ones null", () => {
    expect(patientCells(columns, {})).toEqual(["", null, ""]);
  });
  it("builds the Excel sheet with the labels as header", () => {
    expect(patientsSheet(columns, [{ name: "Ana", age: 1, sex: "M" }])).toEqual({
      header: ["Nome", "Idade", "Sexo"],
      rows: [["Ana", 1, "M"]],
    });
  });
});
