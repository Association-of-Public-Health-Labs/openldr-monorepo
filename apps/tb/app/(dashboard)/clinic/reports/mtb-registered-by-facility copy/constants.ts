import { FacilityType } from "./actions";
import { getLastTwelveMonths } from "./actions";

export const ENDPOINT = "https://dev.openldr.org.mz/tb/gx/facilities/registered_samples/";
export const DEFAULT_TIME_INTERVAL = getLastTwelveMonths();
export const DEFAULT_FACILITY_TYPE: FacilityType = "province";