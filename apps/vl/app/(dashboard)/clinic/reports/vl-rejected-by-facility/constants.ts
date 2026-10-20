import type { PatientFilters } from "@/lib/vl/patients";

export const CARD_ID = "vl-rejected-by-facility";
export const TITLE = "Amostras Rejeitadas por Província";
export const ENDPOINT = "/facilities/rejected_samples_by_facility/";
export const PATIENT_FILTERS: PatientFilters = { rejected: true };
