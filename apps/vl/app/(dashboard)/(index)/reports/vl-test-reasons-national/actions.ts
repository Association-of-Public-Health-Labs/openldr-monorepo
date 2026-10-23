import { vlGetList } from "@/lib/vl/api";
import { intervalParam, type DateRange } from "@/lib/vl/dates";
import { drillParams, INITIAL_DRILL } from "@/lib/vl/drill";
import type { TestReasonByFacility } from "@/lib/vl/types";
import { ENDPOINT } from "../../../clinic/reports/vl-test-reasons/constants";

// The clinic page's "Amostras Testadas por Motivo" at the national level: the same request as that
// card's default view (all provinces), so both show the same figures and share the API's cache.
export { toChart, toExcel } from "../../../clinic/reports/vl-test-reasons/actions";
export { ENDPOINT, PIE_COLORS } from "../../../clinic/reports/vl-test-reasons/constants";

export const fetchData = (range: DateRange, token: string | null) =>
  vlGetList<TestReasonByFacility>(ENDPOINT, { interval_dates: intervalParam(range), ...drillParams(INITIAL_DRILL) }, token);
