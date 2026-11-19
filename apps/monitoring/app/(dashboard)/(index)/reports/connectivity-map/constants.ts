export { NO_DATA_COLOR } from "@/lib/monitoring/colors";

export const CARD_ID = "monitoring-connectivity-map";
export const TITLE = "Conectividade por província";
/** Lowest shade, so a place at 0% stays visible (as EID's maps). */
export const MIN_RATIO = 0.1;

export const LABELS = {
  HOME: "Moçambique",
  PROVINCE_HINT: "Clique numa província para ver os distritos",
  LEGEND: "Conectividade",
  NO_DATA: "Sem sites",
} as const;
