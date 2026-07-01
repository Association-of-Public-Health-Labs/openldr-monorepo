"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import type { DpiDateInterval } from "../../types/summary";
import { formatDpiDateInterval, getLastTwelveMonths } from "../../api/summary";

type DpiCardLoader<T> = (options: { interval: DpiDateInterval; token: string }) => Promise<T>;

export function useDpiSummaryCardData<T>(load: DpiCardLoader<T>, fallbackMessage: string) {
  const { getToken } = useAuth();
  const [interval] = useState<DpiDateInterval>(() => getLastTwelveMonths());
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
        const response = await load({ interval, token });
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
    intervalLabel: formatDpiDateInterval(interval),
    loading,
  };
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 1 }).format(value || 0);
}
