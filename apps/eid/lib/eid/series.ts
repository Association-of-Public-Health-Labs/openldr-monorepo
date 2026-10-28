import { num } from "@repo/design_system/lib/report/format";
import type { Series } from "@repo/design_system/lib/report/series";
import type {
  EquipmentKey,
  LabType,
  RejectionKey,
  TatBracketKey,
  TatKey,
} from "./types";

/** EID brand colour: map shading, KPI accents and one chart series (Testadas). Never on two series of the same chart. */
export const EID_PRIMARY = "#fda92d";
/** Second series colour next to EID_PRIMARY (Negativo, Convencional). */
export const EID_SECONDARY = "#3987e5";

// Colours are the dataviz-skill categorical steps (dark-mode steps, which also pass in
// light mode as one flat hex per series). The last two TAT segments keep VL's tokens
// for the same analysis stages. Validated with scripts/validate_palette.js, both modes.
export const TAT_SEGMENTS: { key: TatKey; label: string; color: string }[] = [
  { key: "collection_hub_reception", label: "Colheita na US a Recepção no Hub", color: "#3987e5" },
  { key: "hub_reception_hub_registration", label: "Recepção ao Registo no Hub", color: "#d95926" },
  { key: "hub_registration_lab_reception", label: "Registo no Hub a Recepção no Lab", color: "#199e70" },
  { key: "lab_reception_lab_registration", label: "Recepção no Lab ao Registo no Lab", color: "#c98500" },
  { key: "lab_registration_analysis", label: "Registo à Análise", color: "#6B53C6" },
  { key: "analysis_validation", label: "Análise à Validação", color: "#00b000" },
];

export const TAT_BRACKETS: { key: TatBracketKey; label: string; color: string }[] = [
  { key: "lt_7", label: "<7 dias", color: "#199e70" },
  { key: "between_7_15", label: "7-15 dias", color: "#3987e5" },
  { key: "between_16_21", label: "16-21 dias", color: "#c98500" },
  { key: "gt_21", label: ">21 dias", color: "#d55181" },
  { key: "no_dates", label: "Sem datas", color: "#8a8a85" },
];

export const REJECTION_REASONS: { key: RejectionKey; label: string; color: string }[] = [
  { key: "repeat_test", label: "Repetir Teste", color: "#3987e5" },
  { key: "insufficient_sample", label: "Amostra Insuficiente", color: "#d95926" },
  { key: "request_without_sample", label: "Requisição Sem Amostra", color: "#199e70" },
  { key: "technical_problems", label: "Problemas Técnicos", color: "#c98500" },
  { key: "overlapping_blood", label: "Sangue Sobreposto", color: "#d55181" },
  { key: "duplicate_registration", label: "Registo Duplicado", color: "#008300" },
  { key: "misidentified_sample", label: "Amostra Mal Identificada", color: "#9085e9" },
  { key: "sample_over_30_days", label: "Amostra com +30 dias de Colheita", color: "#e66767" },
  { key: "other", label: "Outros Motivos", color: "#8a8a85" },
];

export const EQUIPMENT_GROUPS: { key: EquipmentKey; label: string; color: string }[] = [
  { key: "CAPCTM", label: "CAPCTM", color: "#3987e5" },
  { key: "ALINITY", label: "ALINITY", color: "#d95926" },
  { key: "M2000", label: "M2000", color: "#199e70" },
  { key: "C6800", label: "C6800", color: "#c98500" },
  { key: "PANTHER", label: "PANTHER", color: "#d55181" },
  { key: "MPIMA", label: "MPIMA", color: "#008300" },
  { key: "MANUAL", label: "Manual", color: "#9085e9" },
];

export const LAB_TYPE_TABS: { value: LabType; label: string }[] = [
  { value: "conventional", label: "Convencional" },
  { value: "poc", label: "PoC" },
];

const toSeries = <K extends string, R>(
  list: { key: K; label: string; color: string }[],
  rows: R[],
  value: (row: R, key: K) => number | null | undefined,
): Series[] =>
  list.map((item) => ({
    name: item.label,
    color: item.color,
    data: rows.map((row) => num(value(row, item.key))),
  }));

/** Month rows and lab rows alike: only the segment keys are read. */
export const tatSeries = (rows: Record<TatKey, number | null>[]): Series[] => toSeries(TAT_SEGMENTS, rows, (r, k) => r[k]);

export const bracketSeries = (rows: Record<TatBracketKey, number>[]): Series[] => toSeries(TAT_BRACKETS, rows, (r, k) => r[k]);

export const rejectionSeries = (rows: Record<RejectionKey, number>[]): Series[] => toSeries(REJECTION_REASONS, rows, (r, k) => r[k]);

export const equipmentSeries = (rows: Record<EquipmentKey, number>[]): Series[] => toSeries(EQUIPMENT_GROUPS, rows, (r, k) => r[k]);

/**
 * Gender colours (ruling C2): the legacy blue / red families, with the lightness moved so the set passes the
 * dataviz validator (the legacy #008FFB, #7ac6ff, #FF4560, #FF7A91 failed the band and the normal-vision floor).
 * Positive is the dark step, negative the light step of the same hue.
 */
/**
 * Results colours: red = positive, green = negative, on every EID chart that shows results.
 * The pair passes the dataviz validator in light and dark mode (CVD ΔE 6.2, in the 6–8 band, so the
 * legend and the stack gaps are the secondary encoding). Lighter red, darker green: they stay apart in grey.
 */
export const RESULT_COLORS = { positive: "#e85d50", negative: "#17703a" } as const;

/** Gender cards: the same result colours for both sexes; the stack (Masculino / Feminino) tells the sex. */
export const GENDER_COLORS = {
  malePositive: RESULT_COLORS.positive,
  maleNegative: RESULT_COLORS.negative,
  femalePositive: RESULT_COLORS.positive,
  femaleNegative: RESULT_COLORS.negative,
} as const;

type GenderCounts = { male_positive: number | null; male_negative: number | null; female_positive: number | null; female_negative: number | null };

/** Two stacks (Masculino, Feminino), each Positivos then Negativos. */
export const genderSeries = (rows: GenderCounts[]): Series[] => [
  { name: "Masculinos Positivos", group: "Masculino", color: GENDER_COLORS.malePositive, data: rows.map((r) => num(r.male_positive)) },
  { name: "Masculinos Negativos", group: "Masculino", color: GENDER_COLORS.maleNegative, data: rows.map((r) => num(r.male_negative)) },
  { name: "Femininos Positivos", group: "Feminino", color: GENDER_COLORS.femalePositive, data: rows.map((r) => num(r.female_positive)) },
  { name: "Femininos Negativos", group: "Feminino", color: GENDER_COLORS.femaleNegative, data: rows.map((r) => num(r.female_negative)) },
];
