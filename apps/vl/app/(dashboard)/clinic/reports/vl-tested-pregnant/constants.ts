import { TESTED_PATIENTS, type PatientFilters } from "@/lib/vl/patients";

export const CARD_ID = "vl-tested-pregnant";
export const TITLE = "Amostras Testadas (Mulheres Grávidas)";
export const ENDPOINT = "/facilities/tested_samples_pregnant_by_facility/";
export const PATIENT_FILTERS: PatientFilters = { ...TESTED_PATIENTS, pregnant: true };
