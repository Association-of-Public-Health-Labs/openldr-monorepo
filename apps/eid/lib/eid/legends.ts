import {
  EID_PRIMARY,
  EID_SECONDARY,
  EQUIPMENT_GROUPS,
  GENDER_COLORS,
  REJECTION_REASONS,
  TAT_BRACKETS,
  TAT_SEGMENTS,
} from "./series";

/** One row of a card's docs legend. */
export type LegendItem = { label: string; color: string; description: string };

const zip = (items: { label: string; color: string }[], descriptions: string[]): LegendItem[] =>
  items.map((it, i) => ({ label: it.label, color: it.color, description: descriptions[i] }));

/** Convencional / PoC split used by the registered and tested cards. */
export const LAB_TYPE_LEGEND: LegendItem[] = [
  { label: "Convencional", color: EID_SECONDARY, description: "Amostras com IsPoc = No." },
  { label: "PoC", color: EID_PRIMARY, description: "Amostras marcadas como PoC (IsPoc = Yes)." },
];

export const GENDER_LEGEND: LegendItem[] = [
  { label: "Masculinos Positivos", color: GENDER_COLORS.malePositive, description: "Sexo masculino, resultado positivo." },
  { label: "Masculinos Negativos", color: GENDER_COLORS.maleNegative, description: "Sexo masculino, resultado negativo." },
  { label: "Femininos Positivos", color: GENDER_COLORS.femalePositive, description: "Sexo feminino, resultado positivo." },
  { label: "Femininos Negativos", color: GENDER_COLORS.femaleNegative, description: "Sexo feminino, resultado negativo." },
];

/** Stage descriptions of the clinic average-TAT cards. */
export const TAT_SEGMENT_LEGEND: LegendItem[] = zip(TAT_SEGMENTS, [
  "Dias entre a colheita na unidade sanitária e a recepção no Hub.",
  "Dias entre a recepção e o registo no Hub.",
  "Dias entre o registo no Hub e a recepção no laboratório.",
  "Dias entre a recepção e o registo no laboratório.",
  "Dias entre o registo no laboratório e a análise.",
  "Dias entre a análise e a validação.",
]);

/** Stage descriptions of the Sumário monthly TAT card. */
export const TAT_SEGMENT_MEAN_LEGEND: LegendItem[] = zip(TAT_SEGMENTS, [
  "Dias médios entre a colheita e a recepção no Hub.",
  "Dias médios entre a recepção e o registo no Hub.",
  "Dias médios entre o registo no Hub e a recepção no laboratório.",
  "Dias médios entre a recepção e o registo no laboratório.",
  "Dias médios entre o registo e a análise.",
  "Dias médios entre a análise e a validação.",
]);

export const TAT_BRACKET_LEGEND: LegendItem[] = zip(TAT_BRACKETS, [
  "Amostras em que a etapa demorou menos de 7 dias.",
  "Amostras em que a etapa demorou entre 7 e 15 dias.",
  "Amostras em que a etapa demorou entre 16 e 21 dias.",
  "Amostras em que a etapa demorou mais de 21 dias.",
  "Amostras em que falta uma das duas datas da etapa.",
]);

export const EQUIPMENT_LEGEND: LegendItem[] = zip(EQUIPMENT_GROUPS, [
  "Códigos ALINA, AL-IM, ALINB, ALIND e ALINK.",
  "Códigos ALNTA, ALNTY e ALNTB.",
  "Códigos M2000, M200A, M200B e M200C.",
  "Códigos C6800, C6800A, C6800B e C680A.",
  "Códigos PNTHA, PNTHR e PNTHC.",
  "Códigos MPIMA e PIMA.",
  "Códigos MANUA, MGIT e SYSMX, e amostras com o código de equipamento vazio ou em branco.",
]);

/** Where a "default" rejection legend is shown; only the closing "Outros" note differs. */
export type RejectionScope = "summary" | "lab" | "province";

const OTHERS_NOTE: Record<RejectionScope, string> = {
  summary: "Qualquer outro código de rejeição (por exemplo COM, INLS, FDR, REJOL e PRTLA).",
  lab: "Qualquer outro código de rejeição, incluindo REJOL e PRTLA (nos cartões de laboratório contam como Outros).",
  province: "Qualquer outro código de rejeição, incluindo REJOL e PRTLA (neste cartão contam como Outros).",
};

/**
 * Rejection reasons. "default" counts REJOL and PRTLA as Outros; "facility" (the
 * clinic by-month card) shows them as Repetir Teste and Problemas Técnicos.
 */
export function rejectionLegend(variant: "default" | "facility", scope: RejectionScope = "summary"): LegendItem[] {
  if (variant === "facility") {
    return zip(REJECTION_REASONS, [
      "Códigos REPIT, SPUN2 e REJOL.",
      "Códigos INS e UNS.",
      "Códigos RSA, NSRP e SDBSA.",
      "Códigos ERRTC, ACC, PROBT e PRTLA.",
      "Código SASOB.",
      "Código DUPRG.",
      "Código NAME.",
      "Código AM30D.",
      "Qualquer outro código de rejeição.",
    ]);
  }
  return zip(REJECTION_REASONS, [
    "Códigos REPIT e SPUN2.",
    "Códigos INS e UNS.",
    "Códigos RSA, NSRP e SDBSA.",
    "Códigos ERRTC, ACC e PROBT.",
    "Código SASOB.",
    "Código DUPRG.",
    "Código NAME.",
    "Código AM30D.",
    OTHERS_NOTE[scope],
  ]);
}
