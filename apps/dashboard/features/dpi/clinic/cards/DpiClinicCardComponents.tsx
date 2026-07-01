"use client";

import { useCallback } from "react";
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  MonthlyBarChart,
  MonthlyChartLegend,
  MonthlyStackedBarChart,
  RankingBarList,
  REPORT_CARD_HEIGHTS,
  REPORT_CONTENT_HEIGHTS,
  ReportCardShell,
  ReportEmptyState,
  getReportColor,
} from "../../../shared/reporting";
import type { RankingBarItem, ReportColorVariant } from "../../../shared/reporting";
import type { DpiFacilityRequest, DpiGenderMetric, DpiLocationMetric, DpiLocationTatMetric, DpiMonthlyLocationMetric } from "../../types/facility";
import { formatDpiClinicNumber, useDpiClinicCardData } from "./DpiClinicCardUtils";

type Loader<T> = (options: DpiFacilityRequest) => Promise<T>;

type LocationRankingCardProps<T> = {
  adaptValue?: (row: T extends Array<infer U> ? U : never) => number;
  colorVariant?: ReportColorVariant;
  load: Loader<T>;
  subtitle: string;
  title: string;
  valueSuffix?: string;
};

export function DpiLocationRankingCard<T extends DpiLocationMetric[] | DpiLocationTatMetric[]>({
  adaptValue,
  colorVariant = "success",
  load,
  subtitle,
  title,
  valueSuffix = "",
}: LocationRankingCardProps<T>) {
  const stableLoad = useCallback(load, [load]);
  const { data, error, intervalLabel, loading } = useDpiClinicCardData<T>(
    stableLoad,
    `Não foi possível carregar ${title.toLowerCase()}.`,
  );
  const rows = [...(data ?? [])].sort((a, b) => getValue(b) - getValue(a));
  const items = rows.map((row): RankingBarItem => ({
    key: row.locationKey,
    label: row.locationName,
    level: "province",
    value: getValue(row),
  }));

  function getValue(row: DpiLocationMetric | DpiLocationTatMetric) {
    if (adaptValue) return adaptValue(row as never);
    if ("tatAvg" in row) return row.tatAvg;
    return row.total;
  }

  return (
    <ReportCardShell
      cardHeight={REPORT_CARD_HEIGHTS.medium}
      contentHeight={REPORT_CONTENT_HEIGHTS.medium}
      error={error}
      loading={loading}
      subtitle={intervalLabel}
      title={title}
    >
      <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
        <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
          {subtitle}
        </Typography>
        <RankingBarList
          colorVariant={colorVariant}
          height={250}
          items={items}
          maxVisibleItems={8}
          valueFormatter={(value) => `${formatDpiClinicNumber(value)}${valueSuffix}`}
        />
      </Box>
    </ReportCardShell>
  );
}

export function DpiGenderMonthlyCard({ load }: { load: Loader<DpiGenderMetric[]> }) {
  const theme = useTheme();
  const stableLoad = useCallback(load, [load]);
  const { data, error, intervalLabel, loading } = useDpiClinicCardData<DpiGenderMetric[]>(
    stableLoad,
    "Não foi possível carregar as amostras por sexo.",
  );
  const rows = data ?? [];

  return (
    <ReportCardShell
      cardHeight={REPORT_CARD_HEIGHTS.medium}
      contentHeight={REPORT_CONTENT_HEIGHTS.medium}
      error={error}
      loading={loading}
      subtitle={intervalLabel}
      title="Amostras por sexo"
    >
      {rows.length ? (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
          <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
            Distribuição mensal por sexo no período selecionado.
          </Typography>
          <MonthlyStackedBarChart
            height={238}
            points={rows.map((row) => ({
              key: row.monthKey ?? row.monthLabel ?? "sem-mes",
              label: row.shortMonthLabel ?? row.monthLabel ?? "Mês",
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

export function DpiMonthlyIndicatorsCard({
  load,
}: {
  load: (options: DpiFacilityRequest) => Promise<{
    registered: DpiMonthlyLocationMetric[];
    rejected: DpiMonthlyLocationMetric[];
    tat: DpiMonthlyLocationMetric[];
    tested: DpiMonthlyLocationMetric[];
  }>;
}) {
  const stableLoad = useCallback(load, [load]);
  const { data, error, intervalLabel, loading } = useDpiClinicCardData(stableLoad, "Não foi possível carregar os indicadores mensais.");
  const months = buildMonthlyRows(data);

  return (
    <ReportCardShell
      cardHeight={REPORT_CARD_HEIGHTS.table}
      contentHeight={REPORT_CONTENT_HEIGHTS.table}
      error={error}
      loading={loading}
      subtitle={intervalLabel}
      title="Indicadores mensais por localização"
    >
      {months.length ? (
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, flex: 1, minHeight: 0, overflow: "auto" }}>
          <Table size="small" stickyHeader sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 900 }}>Mês</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Registadas</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Testadas</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Rejeitadas</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>TAT médio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {months.map((row) => (
                <TableRow hover key={row.monthKey}>
                  <TableCell sx={{ fontWeight: 850, whiteSpace: "nowrap" }}>{row.monthLabel}</TableCell>
                  <TableCell align="right">{formatDpiClinicNumber(row.registered)}</TableCell>
                  <TableCell align="right">{formatDpiClinicNumber(row.tested)}</TableCell>
                  <TableCell align="right">{formatDpiClinicNumber(row.rejected)}</TableCell>
                  <TableCell align="right">{formatDpiClinicNumber(row.tatAvg)} dias</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : (
        <ReportEmptyState />
      )}
    </ReportCardShell>
  );
}

export function DpiMonthlyBarsCard({
  colorVariant = "info",
  load,
  metric,
  title,
}: {
  colorVariant?: ReportColorVariant;
  load: Loader<DpiMonthlyLocationMetric[]>;
  metric: "registered" | "rejected" | "tatAvg" | "tested" | "total";
  title: string;
}) {
  const stableLoad = useCallback(load, [load]);
  const { data, error, intervalLabel, loading } = useDpiClinicCardData<DpiMonthlyLocationMetric[]>(
    stableLoad,
    `Não foi possível carregar ${title.toLowerCase()}.`,
  );
  const rows = data ?? [];

  return (
    <ReportCardShell cardHeight={REPORT_CARD_HEIGHTS.medium} contentHeight={REPORT_CONTENT_HEIGHTS.medium} error={error} loading={loading} subtitle={intervalLabel} title={title}>
      {rows.length ? (
        <MonthlyBarChart
          colorVariant={colorVariant}
          height={250}
          points={rows.map((row) => ({
            key: row.monthKey,
            label: row.shortMonthLabel,
            value: row[metric],
          }))}
          valueFormatter={(value) => metric === "tatAvg" ? `${formatDpiClinicNumber(value)}d` : formatDpiClinicNumber(value)}
        />
      ) : (
        <ReportEmptyState />
      )}
    </ReportCardShell>
  );
}

function buildMonthlyRows(
  data:
    | {
        registered: DpiMonthlyLocationMetric[];
        rejected: DpiMonthlyLocationMetric[];
        tat: DpiMonthlyLocationMetric[];
        tested: DpiMonthlyLocationMetric[];
      }
    | null,
) {
  if (!data) return [];
  const map = new Map<string, DpiMonthlyLocationMetric>();

  for (const row of data.registered) map.set(row.monthKey, { ...row, registered: row.total });
  for (const row of data.tested) {
    const current = map.get(row.monthKey) ?? row;
    map.set(row.monthKey, { ...current, tested: row.total });
  }
  for (const row of data.rejected) {
    const current = map.get(row.monthKey) ?? row;
    map.set(row.monthKey, { ...current, rejected: row.total });
  }
  for (const row of data.tat) {
    const current = map.get(row.monthKey) ?? row;
    map.set(row.monthKey, { ...current, tatAvg: row.tatAvg });
  }

  return [...map.values()].sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}
