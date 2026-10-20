// Portuguese labels for the values the patients API returns as stored in the LIMS (mostly English).
// The groups follow the API's FINAL_RESULT_*_VALUES lists (api_openldr_python/utilities/utils.py).

export type ResultTone = "detected" | "not_detected" | "indeterminate" | "error" | "invalid" | "other";

export type ResultLabel = { label: string; tone: ResultTone };

const RESULTS: Record<string, ResultLabel> = {
  // Detected
  "detected": { label: "MTB Detectado", tone: "detected" },
  "mtb detected": { label: "MTB Detectado", tone: "detected" },
  "mtb detected hi": { label: "MTB Detectado Alto", tone: "detected" },
  "mtb detected high": { label: "MTB Detectado Alto", tone: "detected" },
  "mtb detected medium": { label: "MTB Detectado Médio", tone: "detected" },
  "mtb detected low": { label: "MTB Detectado Baixo", tone: "detected" },
  "mtb detected very low": { label: "MTB Detectado Muito Baixo", tone: "detected" },
  "mtb detected muito baixo": { label: "MTB Detectado Muito Baixo", tone: "detected" },
  "mtb detectado alto": { label: "MTB Detectado Alto", tone: "detected" },
  "mtb detectado medio": { label: "MTB Detectado Médio", tone: "detected" },
  "mtb detectado baixo": { label: "MTB Detectado Baixo", tone: "detected" },
  "mtb detectado muito baixo": { label: "MTB Detectado Muito Baixo", tone: "detected" },
  "mtb detectado baixissimo": { label: "MTB Detectado Baixíssimo", tone: "detected" },
  "traços de mtb detectados": { label: "Traços de MTB Detectados", tone: "detected" },
  "trace": { label: "Traços de MTB Detectados", tone: "detected" },
  // Not detected
  "not detected": { label: "MTB Não Detectado", tone: "not_detected" },
  "mtb not detected": { label: "MTB Não Detectado", tone: "not_detected" },
  "ndet": { label: "MTB Não Detectado", tone: "not_detected" },
  "micobacterias não tb": { label: "Micobactérias Não TB", tone: "not_detected" },
  "micno": { label: "Micobactérias Não TB", tone: "not_detected" },
  "amk resistance not detected": { label: "Resistência à AMK Não Detectada", tone: "not_detected" },
  "cap resistance not detected": { label: "Resistência à CAP Não Detectada", tone: "not_detected" },
  // Indeterminate
  "indeterminate": { label: "Indeterminado", tone: "indeterminate" },
  "mtb indeterminate": { label: "MTB Indeterminado", tone: "indeterminate" },
  "resistance indeterminate": { label: "Resistência Indeterminada", tone: "indeterminate" },
  "rif resistance indeterminate": { label: "Resistência à RIF Indeterminada", tone: "indeterminate" },
  // Errors
  "error": { label: "Erro", tone: "error" },
  "no result": { label: "Sem Resultado", tone: "error" },
  "nores": { label: "Sem Resultado", tone: "error" },
  "not applicable": { label: "Não Aplicável", tone: "error" },
  "insufficient sample": { label: "Amostra Insuficiente", tone: "error" },
  "ins": { label: "Amostra Insuficiente", tone: "error" },
  "instrument out of order": { label: "Equipamento Avariado", tone: "error" },
  // Invalid
  "invalid": { label: "Inválido", tone: "invalid" },
  "invalido": { label: "Inválido", tone: "invalid" },
  "inválido": { label: "Inválido", tone: "invalid" },
  "not viscous/watery": { label: "Amostra Aquosa / Pouco Viscosa", tone: "invalid" },
  "very viscous": { label: "Amostra Muito Viscosa", tone: "invalid" },
};

/** "MTB Not Detected" → "MTB Não Detectado"; an unknown value is shown as it comes. */
export function resultLabel(value: string | null | undefined): ResultLabel {
  if (!value) return { label: "", tone: "other" };
  return RESULTS[value.trim().toLowerCase()] ?? { label: value, tone: "other" };
}

const SEX: Record<string, string> = { M: "Masculino", F: "Feminino", U: "Desconhecido" };

export function sexLabel(code: string | null | undefined): string {
  if (!code) return "";
  return SEX[code.trim().toUpperCase()] ?? code;
}

/** Dates in the table and the Excel file: 03/10/2026. */
export function formatDay(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleDateString("pt-BR") : "";
}
