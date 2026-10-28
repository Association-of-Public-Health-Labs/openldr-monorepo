import type { TatByLab } from "@/lib/eid/types";
import { codeOf, labFetch, labelOf, toTatChart, toTatExcel } from "@/lib/eid/lab-cards";
import { ENDPOINT } from "./constants";

/** The first request is the cache seed {interval_dates}: no params of its own (the API takes no lab_type here). */
export const fetchData = labFetch<TatByLab>(ENDPOINT);
export { codeOf, labelOf, toTatChart as toChart, toTatExcel as toExcel };
