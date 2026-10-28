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

describe("segmentTitle", () => {
  it("appends the segment label to a card title, falling back to segment 0", async () => {
    const { segmentTitle } = await import("./tat-segment");
    expect(segmentTitle("Tempo de Resposta por Mês (em dias)", 4)).toBe("Tempo de Resposta por Mês (em dias) - Registo à Análise");
    expect(segmentTitle("X", 9)).toBe("X - Colheita na US a Recepção no Hub");
  });
});
