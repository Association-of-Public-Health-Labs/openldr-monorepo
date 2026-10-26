import type { AdminStatus } from "../../hooks/report/report-context";
import { intervalParam, type DateRange } from "./dates";
import type { DrillAction, FacilityLevel } from "./drill";
import type { Params } from "./params";

export const NON_ADMIN_PATIENTS_HINT = "A lista de pacientes está disponível apenas para Administradores.";

/** Facility rows tell non-admins why a click opens no patient list. */
export const facilityHint = (level: FacilityLevel, adminStatus: AdminStatus): string | null =>
  level === "health_facility" && adminStatus === "user" ? NON_ADMIN_PATIENTS_HINT : null;

/** Query of the patients list behind a facility bar. */
export const patientRequestParams = (
  range: DateRange,
  action: Extract<DrillAction, { kind: "patients" }>,
  patientParams: Params = {},
): Params => ({
  interval_dates: intervalParam(range),
  health_facility: action.facility,
  district: action.district ? [action.district] : undefined,
  ...patientParams,
});
