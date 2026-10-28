import { describe, expect, it } from "vitest";
import {
  EQUIPMENT_LEGEND,
  GENDER_LEGEND,
  LAB_TYPE_LEGEND,
  TAT_BRACKET_LEGEND,
  TAT_SEGMENT_LEGEND,
  TAT_SEGMENT_MEAN_LEGEND,
  rejectionLegend,
} from "./legends";
import { EQUIPMENT_GROUPS, REJECTION_REASONS, TAT_BRACKETS, TAT_SEGMENTS } from "./series";

describe("eid legends", () => {
  it("align one description per series entry, in series order and colour", () => {
    const pairs: [{ label: string; color: string }[], { label: string; color: string; description: string }[]][] = [
      [TAT_SEGMENTS, TAT_SEGMENT_LEGEND],
      [TAT_SEGMENTS, TAT_SEGMENT_MEAN_LEGEND],
      [TAT_BRACKETS, TAT_BRACKET_LEGEND],
      [EQUIPMENT_GROUPS, EQUIPMENT_LEGEND],
      [REJECTION_REASONS, rejectionLegend("default")],
      [REJECTION_REASONS, rejectionLegend("facility")],
    ];
    for (const [series, legend] of pairs) {
      expect(legend.map((l) => [l.label, l.color])).toEqual(series.map((s) => [s.label, s.color]));
      expect(legend.every((l) => l.description.length > 0)).toBe(true);
    }
    expect(LAB_TYPE_LEGEND).toHaveLength(2);
    expect(GENDER_LEGEND).toHaveLength(4);
  });
  it("keeps the legend wording of the docs", () => {
    expect(TAT_SEGMENT_LEGEND[0].description).toBe("Dias entre a colheita na unidade sanitária e a recepção no Hub.");
    expect(TAT_SEGMENT_MEAN_LEGEND[4].description).toBe("Dias médios entre o registo e a análise.");
    expect(TAT_BRACKET_LEGEND[1].description).toBe("Amostras em que a etapa demorou entre 7 e 15 dias.");
    expect(EQUIPMENT_LEGEND[6].description).toContain("MANUA, MGIT e SYSMX");
  });
  it("rejection variants differ only where REJOL and PRTLA are placed", () => {
    const d = rejectionLegend("default", "province").map((l) => l.description);
    const f = rejectionLegend("facility").map((l) => l.description);
    expect(d[0]).toBe("Códigos REPIT e SPUN2.");
    expect(d[8]).toBe("Qualquer outro código de rejeição, incluindo REJOL e PRTLA (neste cartão contam como Outros).");
    expect(rejectionLegend("default", "lab")[8].description).toContain("nos cartões de laboratório");
    expect(rejectionLegend("default")[8].description).toContain("por exemplo COM, INLS, FDR");
    expect(f[0]).toBe("Códigos REPIT, SPUN2 e REJOL.");
    expect(f[3]).toBe("Códigos ERRTC, ACC, PROBT e PRTLA.");
    expect(f[8]).toBe("Qualquer outro código de rejeição.");
  });
});
