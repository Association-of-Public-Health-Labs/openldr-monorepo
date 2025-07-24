import { getLastTwelveMonths, FacilityType } from "./actions";

export const ENDPOINT = "https://api.openldr.org.mz/tb/gx/facilities/tested_samples_disaggregated_by_drug_type_by_age/";
export const DEFAULT_TIME_INTERVAL = getLastTwelveMonths();
export const DEFAULT_FACILITY_TYPE: FacilityType = "province";

export const DEFAULT_DRUG = "Rifampicin";