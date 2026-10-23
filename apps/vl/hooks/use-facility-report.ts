"use client";

import { useCallback, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAdminStatus } from "@/lib/vl/admin";
import { vlGetList, type Params } from "@/lib/vl/api";
import { formatPeriodPt, intervalParam, lastYear, type DateRange } from "@/lib/vl/dates";
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
} from "@/lib/vl/drill";
import { fetchPatients, MAX_PER_PAGE, patientFilterParams, type PatientFilters, type PatientRow } from "@/lib/vl/patients";
import { createRequestGate } from "@/lib/vl/request-gate";
import { useReport } from "./use-report";

export type PatientsDialogState = {
  open: boolean;
  title: string;
  rows: PatientRow[];
  total: number;
  loading: boolean;
  error: string | null;
};

export const CLOSED_PATIENTS: PatientsDialogState = { open: false, title: "", rows: [], total: 0, loading: false, error: null };

export type FacilityReportConfig = {
  endpoint: string;
  extraParams?: Params;
  patientFilters?: PatientFilters;
};

type PopupOption = { value?: string; label: string };

export function useFacilityReport<Row>(config: FacilityReportConfig) {
  const { getToken } = useAuth();
  const adminStatus = useAdminStatus();
  const isAdmin = adminStatus === "admin";
  const [range, setRange] = useState<DateRange>(lastYear);
  const [drill, setDrill] = useState<DrillState>(INITIAL_DRILL);
  const [patients, setPatients] = useState<PatientsDialogState>(CLOSED_PATIENTS);
  const patientsGate = useRef(createRequestGate());
  const extraKey = JSON.stringify(config.extraParams ?? {});
  const filtersKey = JSON.stringify(config.patientFilters ?? {});

  const report = useReport<Row[]>(
    // Rows with no place recorded would be a null chart category, which crashes ApexCharts.
    async (token) => withLocation(await vlGetList<Row>(config.endpoint, facilityParams(range, drill, config.extraParams), token)),
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
        const token = await getToken();
        const page = await fetchPatients(
          "by_facility",
          {
            interval_dates: intervalParam(range),
            health_facility: action.facility,
            district: action.district ? [action.district] : undefined,
            ...patientFilterParams(config.patientFilters ?? {}),
          },
          1,
          MAX_PER_PAGE,
          token,
        );
        if (!patientsGate.current.isCurrent(requestId)) return;
        setPatients((prev) => ({ ...prev, rows: page.data, total: page.total_count, loading: false }));
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
    [drill, isAdmin, getToken, range, filtersKey],
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
    facilityHint:
      level === "health_facility" && adminStatus === "user" ? "A lista de pacientes está disponível apenas para Administradores." : null,
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
