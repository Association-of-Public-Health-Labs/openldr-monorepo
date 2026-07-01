"use client";

import type { ReactNode } from "react";
import { useCallback } from "react";
import { FlaskConical, PackageCheck, TestTube2, XCircle } from "lucide-react";
import { ReportErrorState, ReportGrid, SummaryMetricCard } from "../../../shared/reporting";
import { fetchDpiOverviewIndicators } from "../../api/summary";
import type { DpiDateInterval, DpiOverviewIndicators } from "../../types/summary";
import { formatNumber, useDpiSummaryCardData } from "./DpiSummaryCardUtils";

type MetricConfig = {
  color: "error" | "info" | "primary" | "secondary" | "success" | "warning";
  icon: ReactNode;
  key: keyof DpiOverviewIndicators;
  label: string;
  suffix?: string;
};

const metrics: MetricConfig[] = [
  { color: "primary", icon: <TestTube2 size={18} />, key: "totalSamples", label: "Total de Amostras" },
  { color: "success", icon: <PackageCheck size={18} />, key: "registered", label: "Amostras registadas" },
  { color: "info", icon: <FlaskConical size={18} />, key: "tested", label: "Amostras testadas" },
  { color: "error", icon: <XCircle size={18} />, key: "rejected", label: "Amostras rejeitadas" },
];

export function DpiOverviewCards() {
  const loader = useCallback(({ interval, token }: { interval: DpiDateInterval; token: string }) => {
    return fetchDpiOverviewIndicators({ interval, labType: "all", token });
  }, []);
  const { data, error, intervalLabel, loading } = useDpiSummaryCardData<DpiOverviewIndicators>(
    loader,
    "Não foi possível carregar os indicadores principais de DPI.",
  );

  if (error) return <ReportErrorState>{error}</ReportErrorState>;

  return (
    <ReportGrid
      columns={{
        lg: "repeat(4, minmax(0, 1fr))",
        sm: "repeat(2, minmax(0, 1fr))",
        xl: "repeat(4, minmax(0, 1fr))",
        xs: "1fr",
      }}
    >
      {metrics.map((metric) => (
        <SummaryMetricCard
          color={metric.color}
          icon={metric.icon}
          key={metric.key}
          label={metric.label}
          loading={loading}
          periodLabel={intervalLabel}
          suffix={metric.suffix}
          value={formatNumber(data?.[metric.key] ?? 0)}
        />
      ))}
    </ReportGrid>
  );
}
