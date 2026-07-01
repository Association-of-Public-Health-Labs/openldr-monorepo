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
import type { RankingBarItem } from "../../../shared/reporting";
import type { ViralLoadDateInterval } from "../../types/common";
import { formatViralLoadInterval, getDefaultViralLoadInterval } from "../../types/common";
import type { CategoryMetricPoint, FacilityMetricPoint, GenderMetric, MonthlyMetricPoint } from "../../types/facility";

type CardLoader<T> = (options: { interval: ViralLoadDateInterval; token: string }) => Promise<T>;

type RankingCardProps<T> = {
  adapt: (rows: T) => FacilityMetricPoint[];
  cardHeight?: number;
  emptyLabel?: string;
  load: CardLoader<T>;
  metric: "rejected" | "tatAvg" | "total";
  subtitle: string;
  title: string;
  valueSuffix?: string;
};

type CategoryCardProps<T> = {
  adapt: (rows: T) => CategoryMetricPoint[];
  cardHeight?: number;
  load: CardLoader<T>;
  subtitle: string;
  title: string;
};

type MonthlyCardProps<T> = {
  adapt: (rows: T) => MonthlyMetricPoint[];
  cardHeight?: number;
  load: CardLoader<T>;
  metric: "rejected" | "tatAvg" | "tested";
  subtitle: string;
  title: string;
  valueSuffix?: string;
};

type GenderMonthlyCardProps<T> = {
  adapt: (rows: T) => GenderMetric[];
  cardHeight?: number;
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

export function FacilityRankingCard<T>({
  adapt,
  cardHeight = 430,
  emptyLabel = "Sem dados disponíveis para o período selecionado.",
  load,
  metric,
  subtitle,
  title,
  valueSuffix = "",
}: RankingCardProps<T>) {
  const { data, error, interval, loading } = useCardData(load, `Não foi possível carregar ${title.toLowerCase()}.`);
  const rows = data ? [...adapt(data)].sort((a, b) => b[metric] - a[metric]) : [];
  const items = rows.map((row): RankingBarItem => ({
    key: row.locationKey,
    label: row.locationName,
    level: row.level === "health_facility" ? "facility" : row.level,
    value: row[metric],
  }));
  const colorVariant = metric === "rejected" ? "error" : metric === "tatAvg" ? "warning" : "success";

  return (
    <ReportCardShell
      cardHeight={cardHeight}
      contentHeight={REPORT_CONTENT_HEIGHTS.medium}
      error={error}
      loading={loading}
      subtitle={formatViralLoadInterval(interval)}
      title={title}
    >
      <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
        <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
          {subtitle}
        </Typography>
        <RankingBarList
          colorVariant={colorVariant}
          emptyLabel={emptyLabel}
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

export function CategoryBreakdownCard<T>({
  adapt,
  cardHeight = REPORT_CARD_HEIGHTS.medium,
  load,
  subtitle,
  title,
}: CategoryCardProps<T>) {
  const { data, error, interval, loading } = useCardData(load, `Não foi possível carregar ${title.toLowerCase()}.`);
  const rows = data ? [...adapt(data)].sort((a, b) => b.total - a.total) : [];
  const items = rows.map((row): RankingBarItem => ({
    key: row.key,
    label: row.category,
    value: row.total,
  }));

  return (
    <ReportCardShell
      cardHeight={cardHeight}
      contentHeight={REPORT_CONTENT_HEIGHTS.medium}
      error={error}
      loading={loading}
      subtitle={formatViralLoadInterval(interval)}
      title={title}
    >
      <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
        <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
          {subtitle}
        </Typography>
        <RankingBarList colorVariant="info" height={220} items={items} loading={loading} maxVisibleItems={8} />
      </Box>
    </ReportCardShell>
  );
}

export function GenderMonthlyBreakdownCard<T>({
  adapt,
  cardHeight = REPORT_CARD_HEIGHTS.medium,
  load,
  subtitle,
  title,
}: GenderMonthlyCardProps<T>) {
  const theme = useTheme();
  const { data, error, interval, loading } = useCardData(load, `Não foi possível carregar ${title.toLowerCase()}.`);
  const rows = data ? adapt(data).slice(-12) : [];

  return (
    <ReportCardShell
      cardHeight={cardHeight}
      contentHeight={REPORT_CONTENT_HEIGHTS.medium}
      error={error}
      loading={loading}
      subtitle={formatViralLoadInterval(interval)}
      title={title}
    >
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
                { colorVariant: "info", key: "male", label: "Masculino", value: row.male },
                { colorVariant: "success", key: "female", label: "Feminino", value: row.female },
                { colorVariant: "warning", key: "unknown", label: "Não especificado", value: row.unknown },
              ],
              total: row.total,
            }))}
          />
          <MonthlyChartLegend
            items={[
              { color: getReportColor(theme, "info"), label: "Masculino" },
              { color: getReportColor(theme, "success"), label: "Feminino" },
              { color: getReportColor(theme, "warning"), label: "Não especificado" },
            ]}
          />
        </Box>
      ) : (
        <ReportEmptyState />
      )}
    </ReportCardShell>
  );
}

export function MonthlyTrendCard<T>({
  adapt,
  cardHeight = 390,
  load,
  metric,
  subtitle,
  title,
  valueSuffix = "",
}: MonthlyCardProps<T>) {
  const { data, error, interval, loading } = useCardData(load, `Não foi possível carregar ${title.toLowerCase()}.`);
  const rows = data ? adapt(data).slice(-12) : [];

  return (
    <ReportCardShell
      cardHeight={cardHeight}
      contentHeight={REPORT_CONTENT_HEIGHTS.medium}
      error={error}
      loading={loading}
      subtitle={formatViralLoadInterval(interval)}
      title={title}
    >
      {rows.length ? (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
          <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
            {subtitle}
          </Typography>
          <MonthlyBarChart
            colorVariant={metric === "rejected" ? "error" : metric === "tatAvg" ? "warning" : "success"}
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

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 1 }).format(value);
}
