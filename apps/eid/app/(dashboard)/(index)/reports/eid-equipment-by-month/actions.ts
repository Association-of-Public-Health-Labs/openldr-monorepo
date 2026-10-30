import { eidGetList } from "@/lib/eid/api";
import { equipmentMonthChart, equipmentMonthExcel } from "@/lib/eid/stacked-cards";
import type { EquipmentByMonth } from "@/lib/eid/types";
import { intervalParam, type DateRange } from "@repo/design_system/lib/report/dates";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, token: string | null) =>
  eidGetList<EquipmentByMonth>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

export { equipmentMonthChart as toChart, equipmentMonthExcel as toExcel };
