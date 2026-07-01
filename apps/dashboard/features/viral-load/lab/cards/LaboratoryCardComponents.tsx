"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { RankingBarList, ReportCardShell, ReportEmptyState } from "../../../shared/reporting";
import type { RankingBarItem } from "../../../shared/reporting";
import type { ViralLoadDateInterval } from "../../types/common";
import { formatViralLoadInterval, getDefaultViralLoadInterval } from "../../types/common";
import type { LaboratoryMetricPoint, MonthlyLaboratoryMetricPoint, ReasonMetricPoint } from "../../types/laboratory";

type CardLoader<T> = (options: { interval: ViralLoadDateInterval; token: string }) => Promise<T>;

type LabRankingCardProps<T> = {
  adapt: (rows: T) => LaboratoryMetricPoint[];
  colorVariant?: "error" | "info" | "success" | "warning";
  load: CardLoader<T>;
  metric: "rejected" | "tatAvg" | "total";
  subtitle: string;
  title: string;
  valueSuffix?: string;
};

type MonthlyCardProps<T> = {
  adapt: (rows: T) => MonthlyLaboratoryMetricPoint[];
  colorVariant?: "error" | "success" | "warning";
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
    percentage: row.percentage,
    value: row[metric],
  }));

  return (
    <ReportCardShell cardHeight={430} contentHeight={310} error={error} loading={loading} subtitle={formatViralLoadInterval(interval)} title={title}>
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
  const theme = useTheme();
  const { data, error, interval, loading } = useCardData(load, `Não foi possível carregar ${title.toLowerCase()}.`);
  const rows = data ? adapt(data).slice(-12) : [];
  const maxValue = Math.max(...rows.map((row) => row[metric]), 0);

  return (
    <ReportCardShell cardHeight={390} contentHeight={280} error={error} loading={loading} subtitle={formatViralLoadInterval(interval)} title={title}>
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
                      bgcolor: `${colorVariant}.main`,
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

export function LaboratoryReasonCard<T>({ adapt, load, subtitle, title }: ReasonCardProps<T>) {
  const { data, error, interval, loading } = useCardData(load, `Não foi possível carregar ${title.toLowerCase()}.`);
  const rows = data ? adapt(data) : [];
  const items = rows.map((row): RankingBarItem => ({
    key: row.reasonKey,
    label: row.reasonLabel,
    percentage: row.percentage,
    value: row.total,
  }));

  return (
    <ReportCardShell cardHeight={390} contentHeight={280} error={error} loading={loading} subtitle={formatViralLoadInterval(interval)} title={title}>
      <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
        <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
          {subtitle}
        </Typography>
        <RankingBarList colorVariant="info" height={220} items={items} loading={loading} maxVisibleItems={8} />
      </Box>
    </ReportCardShell>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 1 }).format(value);
}

