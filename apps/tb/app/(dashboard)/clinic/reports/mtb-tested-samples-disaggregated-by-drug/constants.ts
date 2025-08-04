import { FacilityType } from "./actions";
import { getLastTwelveMonths } from "./actions";

export const ENDPOINT = `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/tested_samples_disaggregated_by_drug_type/`;
export const DEFAULT_TIME_INTERVAL = getLastTwelveMonths();
export const DEFAULT_FACILITY_TYPE: FacilityType = "province";