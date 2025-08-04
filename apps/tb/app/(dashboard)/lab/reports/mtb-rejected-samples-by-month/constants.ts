import { LabType } from "./actions";
import { getLastTwelveMonths } from "./actions";

export const ENDPOINT = `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/laboratories/rejected_samples_by_month/`;
export const DEFAULT_TIME_INTERVAL = getLastTwelveMonths();
export const DEFAULT_LAB_TYPE: LabType = "Conventional";