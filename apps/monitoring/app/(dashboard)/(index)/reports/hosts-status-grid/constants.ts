import type { Tab } from "./actions";

export const CARD_ID = "monitoring-hosts-status-grid";
export const TITLE = "Estado dos sites";
export const PAGE_SIZE = 20;
export const DEFAULT_TAB: Tab = "Disalab";
export const TABS: { value: Tab; label: string }[] = [
  { value: "Disalab", label: "Disalab" },
  { value: "Disapoc", label: "DisaPoC" },
  { value: "Disalink", label: "DisaLink" },
  { value: "all", label: "Todos" },
];
