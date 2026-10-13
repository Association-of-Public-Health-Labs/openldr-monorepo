import { TESTED_PATIENTS, type PatientFilters } from "@/lib/vl/patients";

export const CARD_ID = "vl-tested-breastfeeding";
export const TITLE = "Amostras Testadas (Mulheres Lactantes)";
export const ENDPOINT = "/facilities/tested_samples_breastfeeding_by_facility/";
export const PATIENT_FILTERS: PatientFilters = { ...TESTED_PATIENTS, breastfeeding: true };
