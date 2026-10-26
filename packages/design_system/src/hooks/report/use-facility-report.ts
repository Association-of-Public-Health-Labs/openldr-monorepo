"use client";

import { useCallback, useRef, useState } from "react";
import { formatPeriodPt, lastYear, type DateRange } from "../../lib/report/dates";
import {
  drillClick,
  drillSubtitle,
  facilityParams,
  fromFilter,
  INITIAL_DRILL,
  LEVEL_LABEL,
  rowLevel,
  withLocation,
  type DrillState,
} from "../../lib/report/drill";
import { facilityHint, patientRequestParams } from "../../lib/report/facility";
import type { Params } from "../../lib/report/params";
import type { PatientRecord } from "../../lib/report/patients";
import { createRequestGate } from "../../lib/report/request-gate";
import { useReportServices } from "./report-context";
import { useReport } from "./use-report";

export type PatientsDialogState = {
  open: boolean;
  title: string;
  rows: PatientRecord[];
  total: number;
  loading: boolean;
  error: string | null;
};

export const CLOSED_PATIENTS: PatientsDialogState = { open: false, title: "", rows: [], total: 0, loading: false, error: null };

export type FacilityReportConfig = {
  endpoint: string;
  extraParams?: Params;
  /** Dashboard-specific filters of the patients list (e.g. VL's patientFilterParams). */
  patientParams?: Params;
};

type PopupOption = { value?: string; label: string };

export function useFacilityReport<Row>(config: FacilityReportConfig) {
  const { getToken, getList, fetchPatients, adminStatus } = useReportServices();
  const isAdmin = adminStatus === "admin";
  const [range, setRange] = useState<DateRange>(lastYear);
  const [drill, setDrill] = useState<DrillState>(INITIAL_DRILL);
  const [patients, setPatients] = useState<PatientsDialogState>(CLOSED_PATIENTS);
  const patientsGate = useRef(createRequestGate());
  const extraKey = JSON.stringify(config.extraParams ?? {});
  const patientKey = JSON.stringify(config.patientParams ?? {});

  const report = useReport<Row[]>(
    // Rows with no place recorded would be a null chart category, which crashes ApexCharts.
    async (token) => withLocation(await getList<Row>(config.endpoint, facilityParams(range, drill, config.extraParams), token)),
    [config.endpoint, range, drill, extraKey],
  );

  const onChartClick = useCallback(
    async (label: string) => {
      const action = drillClick(drill, label, isAdmin);
      if (action.kind === "drill") {
        setDrill(action.next);
        return;
      }
      if (action.kind !== "patients") return;
      const requestId = patientsGate.current.next();
      setPatients({ ...CLOSED_PATIENTS, open: true, title: action.facility, loading: true });
      try {
        if (!fetchPatients) throw new Error("fetchPatients em falta no ReportProvider");
        const token = await getToken();
        const page = await fetchPatients(patientRequestParams(range, action, config.patientParams), token);
        if (!patientsGate.current.isCurrent(requestId)) return;
        setPatients((prev) => ({ ...prev, rows: page.rows, total: page.total, loading: false }));
      } catch (error) {
        if (!patientsGate.current.isCurrent(requestId)) return;
        setPatients((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Ocorreu um erro.",
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drill, isAdmin, getToken, fetchPatients, range, patientKey],
  );

  const onSubmit = useCallback(
    (dates: [string, string], facilities?: PopupOption[], facilityType?: "province" | "district" | "clinic") => {
      setRange({ start: dates[0], end: dates[1] });
      setDrill(facilityType ? fromFilter(facilities ?? [], facilityType) : INITIAL_DRILL);
    },
    [],
  );

  const onRestart = useCallback(() => {
    setRange(lastYear());
    setDrill(INITIAL_DRILL);
  }, []);

  const level = rowLevel(drill);

  return {
    ...report,
    rows: report.data ?? [],
    range,
    drill,
    isAdmin,
    subtitle: drillSubtitle(range, drill, formatPeriodPt),
    exportSubtitle: drillSubtitle(range, drill),
    levelLabel: LEVEL_LABEL[level],
    facilityHint: facilityHint(level, adminStatus),
    onChartClick,
    onSubmit,
    onRestart,
    patients,
    closePatients: () => {
      patientsGate.current.next();
      setPatients(CLOSED_PATIENTS);
    },
  };
}
