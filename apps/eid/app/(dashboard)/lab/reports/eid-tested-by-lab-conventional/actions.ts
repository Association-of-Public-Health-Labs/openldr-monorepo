import type { TestedByLab } from "@/lib/eid/types";
import { codeOf, labFetch, labelOf, toTestedChart, toTestedExcel } from "@/lib/eid/lab-cards";
import { ENDPOINT } from "./constants";

export const fetchData = labFetch<TestedByLab>(ENDPOINT);
export { codeOf, labelOf, toTestedChart as toChart, toTestedExcel as toExcel };
