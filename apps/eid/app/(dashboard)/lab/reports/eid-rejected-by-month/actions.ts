import type { RejectedByMonth } from "@/lib/eid/types";
import { labFetch } from "@/lib/eid/lab-cards";
import { rejectedMonthChart, rejectedMonthExcel } from "@/lib/eid/stacked-cards";
import { ENDPOINT } from "./constants";

export const fetchData = labFetch<RejectedByMonth>(ENDPOINT);
export { rejectedMonthChart as toChart, rejectedMonthExcel as toExcel };
