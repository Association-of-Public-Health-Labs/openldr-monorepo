export const CARD_ID = "eid-key-indicators";
export const TITLE = "Principais Indicadores das Amostras";
export const ENDPOINT = "/summary/indicators/";

/** TB's key-indicator tabs. "all" sends no lab_type (the API default, and the cached default request). */
export type IndicatorsTab = "all" | "conventional" | "poc";
export const TABS: { value: IndicatorsTab; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "conventional", label: "Convencional" },
  { value: "poc", label: "PoC" },
];
export const DEFAULT_TAB: IndicatorsTab = "all";
