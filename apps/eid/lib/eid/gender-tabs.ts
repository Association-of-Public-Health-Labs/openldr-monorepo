import type { Params } from "./api";
import type { LabType } from "./types";

/** "all" sends no lab_type (the cached default request). */
export type GenderTab = "all" | LabType;
export const GENDER_TABS: { value: GenderTab; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "conventional", label: "Convencional" },
  { value: "poc", label: "PoC" },
];
export const DEFAULT_GENDER_TAB: GenderTab = "all";

/** A fresh `{}` for Todos, never `{lab_type: undefined}`, so the card's request keys stay stable. */
export const genderExtraParams = (tab: GenderTab): Params => (tab === "all" ? {} : { lab_type: tab });

/** Legacy title: "<title> - <categoria>". */
export const genderTitle = (title: string, tab: GenderTab) => `${title} - ${GENDER_TABS.find((t) => t.value === tab)?.label ?? ""}`;

/** Patients list of a gender card: analysis date (ruling C4) and the selected lab type, so the list matches the chart. */
export const genderPatientParams = (tab: GenderTab): Params => ({ date_basis: "analysis", ...genderExtraParams(tab) });
