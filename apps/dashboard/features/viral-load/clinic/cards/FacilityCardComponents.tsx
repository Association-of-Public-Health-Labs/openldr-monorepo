"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Box, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { RankingBarList, ReportCardShell, ReportEmptyState } from "../../../shared/reporting";
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
      contentHeight={310}
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
  cardHeight = 390,
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
      contentHeight={280}
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
  cardHeight = 390,
  load,
  subtitle,
  title,
}: GenderMonthlyCardProps<T>) {
  const theme = useTheme();
  const { data, error, interval, loading } = useCardData(load, `Não foi possível carregar ${title.toLowerCase()}.`);
  const rows = data ? adapt(data).slice(-12) : [];
  const maxValue = Math.max(...rows.map((row) => row.total), 0);

  return (
    <ReportCardShell
      cardHeight={cardHeight}
      contentHeight={280}
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
          <Box sx={{ alignItems: "end", display: "grid", flex: 1, gap: 0.9, gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`, minHeight: 0 }}>
            {rows.map((row) => {
              const denominator = Math.max(row.total, 1);
              const height = maxValue ? Math.max((row.total / maxValue) * 100, 8) : 8;
              return (
                <Box key={row.monthKey} sx={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 0.7, justifyContent: "flex-end", minWidth: 0 }}>
                  <Typography color="text.secondary" fontSize={11} fontWeight={800} sx={{ writingMode: { xs: "vertical-rl", sm: "initial" } }}>
                    {formatNumber(row.total)}
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: alpha(theme.palette.grey[500], theme.palette.mode === "dark" ? 0.18 : 0.14),
                      borderRadius: "7px 7px 2px 2px",
                      display: "flex",
                      flexDirection: "column-reverse",
                      height: `${height}%`,
                      minHeight: 20,
                      overflow: "hidden",
                      width: "100%",
                    }}
                  >
                    <Box sx={{ bgcolor: "info.main", height: `${(row.male / denominator) * 100}%`, minHeight: row.male ? 3 : 0 }} />
                    <Box sx={{ bgcolor: "success.main", height: `${(row.female / denominator) * 100}%`, minHeight: row.female ? 3 : 0 }} />
                    <Box sx={{ bgcolor: "warning.main", height: `${(row.unknown / denominator) * 100}%`, minHeight: row.unknown ? 3 : 0 }} />
                  </Box>
                  <Typography color="text.secondary" fontSize={11} fontWeight={800} noWrap>
                    {row.shortMonthLabel}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1.4 }}>
            <Legend color={theme.palette.info.main} label="Masculino" />
            <Legend color={theme.palette.success.main} label="Feminino" />
            <Legend color={theme.palette.warning.main} label="Não especificado" />
          </Box>
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
  const theme = useTheme();
  const { data, error, interval, loading } = useCardData(load, `Não foi possível carregar ${title.toLowerCase()}.`);
  const rows = data ? adapt(data).slice(-12) : [];
  const maxValue = Math.max(...rows.map((row) => row[metric]), 0);

  return (
    <ReportCardShell
      cardHeight={cardHeight}
      contentHeight={280}
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
          <Box sx={{ alignItems: "end", display: "grid", flex: 1, gap: 0.9, gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`, minHeight: 0 }}>
            {rows.map((row) => {
              const value = row[metric];
              return (
                <Box key={row.monthKey} sx={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 0.75, justifyContent: "flex-end", minWidth: 0 }}>
                  <Typography color="text.secondary" fontSize={11} fontWeight={800} sx={{ writingMode: { xs: "vertical-rl", sm: "initial" } }}>
                    {formatNumber(value)}{valueSuffix}
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: metric === "rejected" ? "error.main" : metric === "tatAvg" ? "warning.main" : "success.main",
                      borderRadius: "7px 7px 2px 2px",
                      height: `${maxValue ? Math.max((value / maxValue) * 100, 5) : 5}%`,
                      minHeight: 8,
                      opacity: theme.palette.mode === "dark" ? 0.86 : 0.92,
                      width: "100%",
                    }}
                  />
                  <Typography color="text.secondary" fontSize={11} fontWeight={800} noWrap>
                    {row.shortMonthLabel}
                  </Typography>
                </Box>
              );
            })}
          </Box>
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

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ alignItems: "center", display: "flex", gap: 0.7 }}>
      <Box sx={{ bgcolor: color, borderRadius: 999, height: 8, width: 8 }} />
      <Typography color="text.secondary" fontSize={11.5} fontWeight={800}>
        {label}
      </Typography>
    </Box>
  );
}
