import { LabType } from "./actions";
import { getLastTwelveMonths } from "./actions";

export const ENDPOINT = "https://api.openldr.org.mz/tb/gx/laboratories/registered_samples/";
export const DEFAULT_TIME_INTERVAL = getLastTwelveMonths();
export const DEFAULT_LAB_TYPE: LabType = "Conventional";