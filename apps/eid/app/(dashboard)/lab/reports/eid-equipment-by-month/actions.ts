import type { EquipmentByMonth } from "@/lib/eid/types";
import { labFetch } from "@/lib/eid/lab-cards";
import { equipmentMonthChart, equipmentMonthExcel } from "@/lib/eid/stacked-cards";
import { ENDPOINT } from "./constants";

export const fetchData = labFetch<EquipmentByMonth>(ENDPOINT);
export { equipmentMonthChart as toChart, equipmentMonthExcel as toExcel };
