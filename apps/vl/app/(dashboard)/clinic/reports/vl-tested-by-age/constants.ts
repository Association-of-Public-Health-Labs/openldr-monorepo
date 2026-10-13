import type { AgeRange } from "@/lib/vl/age";
import { TESTED_PATIENTS, type PatientFilters } from "@/lib/vl/patients";

export const CARD_ID = "vl-tested-by-age";
export const TITLE = "Amostras Testadas por idade";
export const ENDPOINT = "/facilities/tested_samples_by_age_by_facility/";
export const patientFiltersFor = (age: AgeRange): PatientFilters => ({ ...TESTED_PATIENTS, age_range: age });
