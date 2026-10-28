export const CARD_ID = "eid-province-map";
export const TITLE = "Amostras por Província";
export const ENDPOINT = "/summary/indicators_by_province/";
export const DRILL_ENDPOINT = "/facilities/key_indicators/";

/** Grey for a place without a row (the kit's "Sem dados" grey). */
export const NO_DATA_COLOR = "#C4CDD5";
/** Lowest shade, so a place at 0% positivity stays visible (the district maps' own floor). */
export const MIN_RATIO = 0.1;

export const LABELS = {
  HOME: "Moçambique",
  PROVINCE_HINT: "Clique numa província para ver os distritos",
  PROVINCE_TILES_CAPTION: "Indicadores da província: todos os tipos de laboratório (não mudam com Convencional / PoC).",
  DISTRICT_HINT: "Clique num distrito para ver as unidades sanitárias",
  FACILITY_TABLE: "Unidades sanitárias do distrito",
  FACILITY_SEARCH: "Procurar unidade sanitária",
  FACILITY_EMPTY: "Sem dados para este distrito no período.",
  FACILITY_TOTAL: "Total do distrito",
  NO_FACILITY: "Sem unidade sanitária",
  LEGEND: "Positividade",
  NO_DATA: "Sem dados",
} as const;
