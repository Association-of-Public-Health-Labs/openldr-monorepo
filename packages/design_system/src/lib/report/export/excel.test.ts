import { describe, expect, it } from "vitest";
import { safeFileName, sheetName, sheetToAoa } from "./excel";

describe("excel helpers", () => {
  it("builds title, subtitle, blank line, header and rows", () => {
    expect(sheetToAoa("Título", "Período", { header: ["", "Jan/26"], rows: [["Total", 3]] })).toEqual([
      ["Título"],
      ["Período"],
      [],
      ["", "Jan/26"],
      ["Total", 3],
    ]);
  });
  it("makes safe file and sheet names", () => {
    expect(safeFileName("Tempo de Resposta médio Nacional")).toBe("Tempo_de_Resposta_medio_Nacional");
    expect(sheetName("Amostras Testadas por Província/sexo [teste]: muito longo")).toBe("Amostras Testadas por Província");
    expect(sheetName("A/B")).toBe("AB");
  });
});
