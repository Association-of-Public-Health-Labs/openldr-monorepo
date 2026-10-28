import type { EquipmentByLab } from "@/lib/eid/types";
import { labFetch } from "@/lib/eid/lab-cards";
import { equipmentLabChart, equipmentLabExcel } from "@/lib/eid/stacked-cards";
import { ENDPOINT } from "./constants";

export const fetchData = labFetch<EquipmentByLab>(ENDPOINT);
export { equipmentLabChart as toChart, equipmentLabExcel as toExcel };
