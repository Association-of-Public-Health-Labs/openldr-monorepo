import type { PatientFilters } from "@/lib/vl/patients";

export const CARD_ID = "vl-registered-by-facility";
export const TITLE = "Amostras Registadas por Província";
export const ENDPOINT = "/facilities/registered_samples/";
export const PATIENT_FILTERS: PatientFilters = { date_basis: "registration" };
