import type { StateFilter } from "./actions";

export const CARD_ID = "monitoring-connectivity-history";
export const TITLE = "Histórico de conectividade";
export const STATE_TABS: { value: StateFilter; label: string }[] = [
  { value: "Todos", label: "Todos" },
  { value: "Pendentes", label: "Pendentes" },
  { value: "Completos", label: "Completos" },
];
