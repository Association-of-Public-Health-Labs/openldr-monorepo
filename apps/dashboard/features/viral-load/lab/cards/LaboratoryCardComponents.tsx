"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  getReportColor,
  MonthlyBarChart,
  MonthlyChartLegend,
  MonthlyStackedBarChart,
  RankingBarList,
  REPORT_CARD_HEIGHTS,
  REPORT_CONTENT_HEIGHTS,
  ReportCardShell,
  ReportEmptyState,
} from "../../../shared/reporting";
import type { RankingBarItem, ReportColorVariant } from "../../../shared/reporting";
import type { ViralLoadDateInterval } from "../../types/common";
import { formatViralLoadInterval, getDefaultViralLoadInterval } from "../../types/common";
import type {
  LaboratoryMetricPoint,
  MonthlyLaboratoryMetricPoint,
  MonthlyReasonMetricPoint,
  ReasonMetricPoint,
} from "../../types/laboratory";

type CardLoader<T> = (options: { interval: ViralLoadDateInterval; token: string }) => Promise<T>;

type LabRankingCardProps<T> = {
  adapt: (rows: T) => LaboratoryMetricPoint[];
  colorVariant?: ReportColorVariant;
  load: CardLoader<T>;
  metric: "rejected" | "tatAvg" | "total";
  subtitle: string;
  title: string;
  valueSuffix?: string;
};

type MonthlyCardProps<T> = {
  adapt: (rows: T) => MonthlyLaboratoryMetricPoint[];
  colorVariant?: ReportColorVariant;
  load: CardLoader<T>;
  metric: "rejected" | "tatAvg" | "tested" | "total";
  subtitle: string;
  title: string;
  valueSuffix?: string;
};

type ReasonCardProps<T> = {
  adapt: (rows: T) => ReasonMetricPoint[];
  load: CardLoader<T>;
  subtitle: string;
  title: string;
};

type ReasonMonthlyCardProps<T> = {
  adapt: (rows: T) => MonthlyReasonMetricPoint[];
  load: CardLoader<T>;
  subtitle: string;
  title: string;
};

function useCardData<T>(load: CardLoader<T>, fallbackMessage: string) {
  const { getToken } = useAuth();
  const [interval] = useState<ViralLoadDateInterval>(() => getDefaultViralLoadInterval());
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
        if (alive) setError(cause instanceof Error ? cause.message : fallbackMessage);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadData();
    return () => {
      alive = false;
    };
  }, [fallbackMessage, getToken, interval, load]);

  return { data, error, interval, loading };
}

export function LaboratoryRankingCard<T>({
  adapt,
  colorVariant = "success",
  load,
  metric,
  subtitle,
  title,
  valueSuffix = "",
}: LabRankingCardProps<T>) {
  const { data, error, interval, loading } = useCardData(load, `Não foi possível carregar ${title.toLowerCase()}.`);
  const rows = data ? [...adapt(data)].sort((a, b) => b[metric] - a[metric]) : [];
  const items = rows.map((row): RankingBarItem => ({
    key: row.labKey,
    label: row.labName,
    level: "facility",
    value: row[metric],
  }));

  return (
    <ReportCardShell cardHeight={REPORT_CARD_HEIGHTS.medium} contentHeight={REPORT_CONTENT_HEIGHTS.medium} error={error} loading={loading} subtitle={formatViralLoadInterval(interval)} title={title}>
      <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
        <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
          {subtitle}
        </Typography>
        <RankingBarList
          colorVariant={colorVariant}
          height={250}
          items={items}
          loading={loading}
          maxVisibleItems={8}
          valueFormatter={(value) => `${formatNumber(value)}${valueSuffix}`}
        />
      </Box>
    </ReportCardShell>
  );
}

export function LaboratoryMonthlyCard<T>({
  adapt,
  colorVariant = "success",
  load,
  metric,
  subtitle,
  title,
  valueSuffix = "",
}: MonthlyCardProps<T>) {
  const { data, error, interval, loading } = useCardData(load, `Não foi possível carregar ${title.toLowerCase()}.`);
  const rows = data ? adapt(data).slice(-12) : [];

  return (
    <ReportCardShell cardHeight={REPORT_CARD_HEIGHTS.medium} contentHeight={REPORT_CONTENT_HEIGHTS.medium} error={error} loading={loading} subtitle={formatViralLoadInterval(interval)} title={title}>
      {rows.length ? (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
          <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
            {subtitle}
          </Typography>
          <MonthlyBarChart
            colorVariant={colorVariant}
            height={238}
            points={rows.map((row) => ({
              key: row.monthKey,
              label: row.shortMonthLabel,
              value: row[metric],
            }))}
            valueFormatter={(value) => `${formatNumber(value)}${valueSuffix}`}
          />
        </Box>
      ) : (
        <ReportEmptyState />
      )}
    </ReportCardShell>
  );
}

export function LaboratoryReasonCard<T>({ adapt, load, subtitle, title }: ReasonCardProps<T>) {
  const { data, error, interval, loading } = useCardData(load, `Não foi possível carregar ${title.toLowerCase()}.`);
  const rows = data ? adapt(data) : [];
  const items = rows.map((row): RankingBarItem => ({
    key: row.reasonKey,
    label: row.reasonLabel,
    value: row.total,
  }));

  return (
    <ReportCardShell cardHeight={REPORT_CARD_HEIGHTS.medium} contentHeight={REPORT_CONTENT_HEIGHTS.medium} error={error} loading={loading} subtitle={formatViralLoadInterval(interval)} title={title}>
      <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
        <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
          {subtitle}
        </Typography>
        <RankingBarList colorVariant="info" height={220} items={items} loading={loading} maxVisibleItems={8} />
      </Box>
    </ReportCardShell>
  );
}

export function LaboratoryReasonMonthlyCard<T>({
  adapt,
  load,
  subtitle,
  title,
}: ReasonMonthlyCardProps<T>) {
  const theme = useTheme();
  const { data, error, interval, loading } = useCardData(load, `Não foi possível carregar ${title.toLowerCase()}.`);
  const rows = data ? adapt(data).slice(-12) : [];

  return (
    <ReportCardShell cardHeight={REPORT_CARD_HEIGHTS.medium} contentHeight={REPORT_CONTENT_HEIGHTS.medium} error={error} loading={loading} subtitle={formatViralLoadInterval(interval)} title={title}>
      {rows.length ? (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
          <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
            {subtitle}
          </Typography>
          <MonthlyStackedBarChart
            height={238}
            points={rows.map((row) => ({
              key: row.monthKey,
              label: row.shortMonthLabel,
              segments: [
                { colorVariant: "success", key: "routine", label: "Rotina", value: row.routine },
                { colorVariant: "warning", key: "treatment-failure", label: "Falha terapêutica", value: row.treatmentFailure },
                { colorVariant: "info", key: "not-specified", label: "Não especificado", value: row.reasonNotSpecified },
              ],
              total: row.total,
            }))}
          />
          <MonthlyChartLegend
            items={[
              { color: getReportColor(theme, "success"), label: "Rotina" },
              { color: getReportColor(theme, "warning"), label: "Falha terapêutica" },
              { color: getReportColor(theme, "info"), label: "Não especificado" },
            ]}
          />
        </Box>
      ) : (
        <ReportEmptyState />
      )}
    </ReportCardShell>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 1 }).format(value);
}
