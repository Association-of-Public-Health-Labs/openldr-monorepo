import type { LabType } from "@/lib/eid/types";

export const CARD_ID = "eid-tested-by-month";
export const TITLE = "Amostras Testadas/Mês";
export const ENDPOINT = "/laboratories/tested_samples_by_month/";

/** "all" sends no lab_type (the cached default request). */
export type TestedTab = "all" | LabType;
export const TABS: { value: TestedTab; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "conventional", label: "Convencional" },
  { value: "poc", label: "PoC" },
];
export const DEFAULT_TAB: TestedTab = "all";
