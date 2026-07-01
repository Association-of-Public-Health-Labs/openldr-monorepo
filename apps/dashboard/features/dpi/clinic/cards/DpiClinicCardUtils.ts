"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { formatReportDateRangeLabel, getDefaultReportDateInterval } from "../../../shared/reporting/dateRange";
import type { DpiFacilityRequest } from "../../types/facility";
import type { DpiDateInterval } from "../../types/summary";

type ClinicLoader<T> = (options: DpiFacilityRequest) => Promise<T>;

export function useDpiClinicCardData<T>(load: ClinicLoader<T>, fallbackMessage: string) {
  const { getToken } = useAuth();
  const [interval] = useState<DpiDateInterval>(() => getDefaultReportDateInterval());
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        if (!token) throw new Error("Sessão expirada. Inicie sessão novamente.");
        const response = await load({
          disaggregation: false,
          facilityType: "province",
          interval,
          labType: "all",
          token,
        });
        if (alive) setData(response);
      } catch (cause) {
        if (!alive) return;
        if (cause instanceof Error && cause.message === "Sessão expirada. Inicie sessão novamente.") {
          setError(cause.message);
          return;
        }
        setError(fallbackMessage);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadData();
    return () => {
      alive = false;
    };
  }, [fallbackMessage, getToken, interval, load]);

  return {
    data,
    error,
    interval,
    intervalLabel: formatReportDateRangeLabel(interval),
    loading,
  };
}

export function formatDpiClinicNumber(value: number) {
  return new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 1 }).format(value || 0);
}
