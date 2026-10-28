import { describe, expect, it } from "vitest";
import {
  EID_PRIMARY,
  EQUIPMENT_GROUPS,
  LAB_TYPE_TABS,
  REJECTION_REASONS,
  TAT_BRACKETS,
  TAT_SEGMENTS,
  bracketSeries,
  equipmentSeries,
  rejectionSeries,
  genderSeries,
  GENDER_COLORS,
  RESULT_COLORS,
  tatSeries,
} from "./series";
import type { EquipmentByMonth, RejectedByMonth, TatBracketsByMonth, TatByMonth } from "./types";

const month = { year: 2026, month: 1, month_name: "January" };

describe("eid series", () => {
  it("TAT_SEGMENTS has the 6 API keys in order with the legacy labels", () => {
    expect(TAT_SEGMENTS.map((s) => s.key)).toEqual([
      "collection_hub_reception",
      "hub_reception_hub_registration",
      "hub_registration_lab_reception",
      "lab_reception_lab_registration",
      "lab_registration_analysis",
      "analysis_validation",
    ]);
    expect(TAT_SEGMENTS[0].label).toBe("Colheita na US a Recepção no Hub");
    expect(TAT_SEGMENTS[5].label).toBe("Análise à Validação");
  });
  it("REJECTION_REASONS has the 9 API keys in order", () => {
    expect(REJECTION_REASONS.map((r) => r.key)).toEqual([
      "repeat_test",
      "insufficient_sample",
      "request_without_sample",
      "technical_problems",
      "overlapping_blood",
      "duplicate_registration",
      "misidentified_sample",
      "sample_over_30_days",
      "other",
    ]);
    expect(REJECTION_REASONS[8].label).toBe("Outros Motivos");
  });
  it("brackets, equipment and tabs match the brief", () => {
    expect(TAT_BRACKETS.map((b) => [b.key, b.label])).toEqual([
      ["lt_7", "<7 dias"],
      ["between_7_15", "7-15 dias"],
      ["between_16_21", "16-21 dias"],
      ["gt_21", ">21 dias"],
      ["no_dates", "Sem datas"],
    ]);
    expect(EQUIPMENT_GROUPS.map((e) => e.key)).toEqual(["CAPCTM", "ALINITY", "M2000", "C6800", "PANTHER", "MPIMA", "MANUAL"]);
    expect(EQUIPMENT_GROUPS.map((e) => e.label)).toEqual(["CAPCTM", "ALINITY", "M2000", "C6800", "PANTHER", "MPIMA", "Manual"]);
    expect(LAB_TYPE_TABS).toEqual([
      { value: "conventional", label: "Convencional" },
      { value: "poc", label: "PoC" },
    ]);
  });
  it("tatSeries turns null into 0 and keeps list order", () => {
    const row: TatByMonth = {
      ...month,
      collection_hub_reception: 4,
      hub_reception_hub_registration: 1,
      hub_registration_lab_reception: 2,
      lab_reception_lab_registration: 3,
      lab_registration_analysis: 5,
      analysis_validation: null,
    };
    const s = tatSeries([row]);
    expect(s).toHaveLength(6);
    expect(s[0].data).toEqual([4]);
    expect(s[5].data).toEqual([0]);
    expect(s[0].name).toBe(TAT_SEGMENTS[0].label);
  });
  it("bracketSeries, rejectionSeries and equipmentSeries map one series per key", () => {
    const b: TatBracketsByMonth = { ...month, category: "collection_hub_reception", lt_7: 1, between_7_15: 2, between_16_21: 3, gt_21: 4, no_dates: 5 };
    expect(bracketSeries([b]).map((s) => s.data[0])).toEqual([1, 2, 3, 4, 5]);
    const r = { ...month, total: 9, repeat_test: 1, other: 2 } as RejectedByMonth;
    const rs = rejectionSeries([r]);
    expect(rs).toHaveLength(9);
    expect(rs[0].data).toEqual([1]);
    expect(rs[8].data).toEqual([2]);
    expect(rs[1].data).toEqual([0]);
    const e = { ...month, tested: 3, CAPCTM: 2, MANUAL: 1 } as EquipmentByMonth;
    const es = equipmentSeries([e]);
    expect(es.map((s) => s.name)).toContain("Manual");
    expect(es[0].data).toEqual([2]);
  });
  it("colours are unique within each list and #fda92d is never a series colour", () => {
    for (const list of [TAT_SEGMENTS, TAT_BRACKETS, REJECTION_REASONS, EQUIPMENT_GROUPS]) {
      const colors = list.map((x) => x.color.toLowerCase());
      expect(new Set(colors).size).toBe(colors.length);
      expect(colors).not.toContain(EID_PRIMARY);
    }
  });
});

describe("genderSeries", () => {
  it("gives 4 grouped series in C2 order, null as 0", () => {
    const s = genderSeries([
      { male_positive: 1, male_negative: 2, female_positive: null, female_negative: 4 } as never,
    ]);
    expect(s.map((x) => [x.name, x.group, x.color, x.data])).toEqual([
      ["Masculinos Positivos", "Masculino", GENDER_COLORS.malePositive, [1]],
      ["Masculinos Negativos", "Masculino", GENDER_COLORS.maleNegative, [2]],
      ["Femininos Positivos", "Feminino", GENDER_COLORS.femalePositive, [0]],
      ["Femininos Negativos", "Feminino", GENDER_COLORS.femaleNegative, [4]],
    ]);
  });
  it("colours results by outcome: red for positive, green for negative, for both sexes", () => {
    expect(GENDER_COLORS).toEqual({
      malePositive: RESULT_COLORS.positive,
      maleNegative: RESULT_COLORS.negative,
      femalePositive: RESULT_COLORS.positive,
      femaleNegative: RESULT_COLORS.negative,
    });
  });
});

describe("RESULT_COLORS", () => {
  it("is red for positive and green for negative (validated pair, light and dark)", () => {
    expect(RESULT_COLORS).toEqual({ positive: "#e85d50", negative: "#17703a" });
  });
});
