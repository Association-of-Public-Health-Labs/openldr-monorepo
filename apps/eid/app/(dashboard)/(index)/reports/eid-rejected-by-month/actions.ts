import { eidGetList } from "@/lib/eid/api";
import { rejectedMonthChart, rejectedMonthExcel } from "@/lib/eid/stacked-cards";
import type { RejectedByMonth } from "@/lib/eid/types";
import { intervalParam, type DateRange } from "@repo/design_system/lib/report/dates";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, token: string | null) =>
  eidGetList<RejectedByMonth>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

export { rejectedMonthChart as toChart, rejectedMonthExcel as toExcel };
