export const CARD_ID = "vl-suppression-map";
export const TITLE = "Média da Supressão Viral";
export const ENDPOINT = "/summary/suppression_by_province_by_month/";
export const FACILITY_ENDPOINT = "/facilities/tested_samples_by_facility/";

// Accented names for the breadcrumb (the API and the maps use unaccented keys).
export const PROVINCE_LABELS: Record<string, string> = { Zambezia: "Zambézia", "Maputo Provincia": "Maputo Província" };

export const LABELS = {
  HOME: "Moçambique",
  PROVINCE_HINT: "Clique numa província para ver os distritos",
  DISTRICT_HINT: "Clique num distrito para ver as unidades sanitárias",
  FACILITY_TABLE: "Unidades sanitárias do distrito",
  FACILITY_SEARCH: "Procurar unidade sanitária",
  FACILITY_EMPTY: "Sem dados para este distrito no período.",
  FACILITY_TOTAL: "Total do distrito",
} as const;
export const MAP_COLOR = "#00b000";
