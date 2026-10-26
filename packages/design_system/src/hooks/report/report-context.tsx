"use client";

import { createContext, useContext } from "react";
import type { Params } from "../../lib/report/params";

export type AdminStatus = "admin" | "user" | "unknown";

export type ReportServices = {
  getToken: () => Promise<string | null>;
  user: { name: string; email: string };
  getList: <Row>(endpoint: string, params: Params, token: string | null) => Promise<Row[]>;
  fetchPatients?: (
    params: Params,
    token: string | null,
  ) => Promise<{ rows: Record<string, unknown>[]; total: number }>;
  adminStatus: AdminStatus;
};

const ReportContext = createContext<ReportServices | null>(null);

export function ReportProvider(props: { value: ReportServices; children: React.ReactNode }) {
  return <ReportContext.Provider value={props.value}>{props.children}</ReportContext.Provider>;
}

/** Pure reader: throws when there is no provider. */
export function readReportServices(value: ReportServices | null): ReportServices {
  if (!value) throw new Error("ReportProvider em falta");
  return value;
}

export function useReportServices(): ReportServices {
  return readReportServices(useContext(ReportContext));
}
