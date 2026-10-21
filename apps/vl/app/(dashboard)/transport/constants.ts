export const MAP_CARD_ID = "vl-transport-map";
export const DETAIL_CARD_ID = "vl-transport-detail";

/** Weeks in the picker and the weekly chart. */
export const WEEK_COUNT = 28;

// Accented names (the API and the maps use unaccented keys).
export const PROVINCE_LABELS: Record<string, string> = { Zambezia: "Zambézia", "Maputo Provincia": "Maputo Província" };

export const LABELS = {
  PAGE_TITLE: "Monitoria de Transporte de Amostras",
  LEG: "Colheita à recepção no laboratório",
  MAP_TITLE: "Tempo de transporte das amostras",
  PROVINCE_HINT: "Clique numa província para ver os distritos",
  DISTRICT_HINT: "Clique num distrito para ver as unidades sanitárias",
  OTHER_DISTRICT_HINT: "Clique noutro distrito para o ver",
  CLICK_HINT: "Clique para ver os distritos",
  SELECT_TITLE: "Seleccione uma área",
  SELECT_TEXT: "Clique numa província para ver os distritos, e num distrito para ver as unidades sanitárias.",
} as const;
