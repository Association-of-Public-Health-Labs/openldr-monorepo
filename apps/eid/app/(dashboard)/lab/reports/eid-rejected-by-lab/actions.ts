import type { RejectedByLab } from "@/lib/eid/types";
import { labFetch } from "@/lib/eid/lab-cards";
import { rejectedLabChart, rejectedLabExcel } from "@/lib/eid/stacked-cards";
import { ENDPOINT } from "./constants";

export const fetchData = labFetch<RejectedByLab>(ENDPOINT);
export { rejectedLabChart as toChart, rejectedLabExcel as toExcel };
