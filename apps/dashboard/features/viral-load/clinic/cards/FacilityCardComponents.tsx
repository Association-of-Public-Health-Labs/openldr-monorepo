"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Box, Stack, Typography } from "@mui/material";
import { Button } from "@repo/design_system/app/atoms/inputs/Button";
import { useTheme } from "@mui/material/styles";
import {
  buildGeoDrilldownParams,
  formatReportIntervalDates,
  getReportColor,
  MonthlyBarChart,
  MonthlyChartLegend,
  MonthlyStackedBarChart,
  RankingBarList,
  REPORT_CARD_HEIGHTS,
  REPORT_CONTENT_HEIGHTS,
  ReportCardShell,
  ReportEmptyState,
  reportActionIcons,
} from "../../../shared/reporting";
import type { GeoDrilldownInCardLevel, RankingBarItem, ReportActionDateRange } from "../../../shared/reporting";
import { ViralLoadPatientDrilldownDialog } from "../../patients/components/ViralLoadPatientDrilldownDialog";
import type { ViralLoadDateInterval } from "../../types/common";
import { formatViralLoadInterval, getDefaultViralLoadInterval } from "../../types/common";
import type { CategoryMetricPoint, FacilityMetricPoint, GenderMetric, MonthlyMetricPoint, ViralLoadFacilityLevel } from "../../types/facility";

type CardLoader<T> = (options: {
  disaggregation?: boolean;
  district?: string[];
  facilityType?: ViralLoadFacilityLevel;
  healthFacility?: string;
  interval: ViralLoadDateInterval;
  province?: string[];
  token: string;
}) => Promise<T>;

type RankingCardProps<T> = {
  adapt: (rows: T, level: ViralLoadFacilityLevel) => FacilityMetricPoint[];
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
  const { getToken } = useAuth();
  const [interval, setInterval] = useState<ViralLoadDateInterval>(() => getDefaultViralLoadInterval());
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState<GeoDrilldownInCardLevel>("province");
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>();
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>();
  const [patientsOpen, setPatientsOpen] = useState(false);
  const [selectedPatientFacility, setSelectedPatientFacility] = useState<string | undefined>();

  const displayLevel: ViralLoadFacilityLevel =
    currentLevel === "facility" ? "health_facility" : currentLevel === "district" ? "district" : "province";

  const rows = data ? [...adapt(data, displayLevel)].sort((a, b) => b[metric] - a[metric]) : [];
  const items = rows.map((row): RankingBarItem => ({
    canDrillDown: row.canDrillDown,
    id: row.locationKey,
    key: row.locationKey,
    label: row.locationName,
    level: row.level === "health_facility" ? "facility" : row.level,
    value: row[metric],
  }));
  const colorVariant = metric === "rejected" ? "error" : metric === "tatAvg" ? "warning" : "success";
  const dateRange: ReportActionDateRange = useMemo(
    () => ({
      displayLabel: formatViralLoadInterval(interval),
      endDateIso: interval.endDate,
      intervalDates: formatReportIntervalDates(interval),
      startDateIso: interval.startDate,
    }),
    [interval],
  );
  const breadcrumbItems = ["Nacional", selectedProvince, selectedDistrict].filter(Boolean);
  const breadcrumb = breadcrumbItems.join(" → ");
  const subtitleWithBreadcrumb =
    currentLevel === "province" ? formatViralLoadInterval(interval) : `${formatViralLoadInterval(interval)} | ${breadcrumbItems.slice(1).join(" → ")}`;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("Sessão expirada. Inicie sessão novamente.");
      const params = buildGeoDrilldownParams({
        level: currentLevel,
        selectedDistrict,
        selectedProvince,
      });
      const response = await load({ ...params, interval, token });
      setData(response);
    } catch (cause) {
      setData(null);
      setError(cause instanceof Error ? cause.message : `Não foi possível carregar ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [currentLevel, getToken, interval, load, selectedDistrict, selectedProvince, title]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDatesChange = ([startDate, endDate]: [string, string]) => {
    setInterval({ startDate, endDate });
    resetToNational();
  };

  const resetToNational = () => {
    setCurrentLevel("province");
    setSelectedProvince(undefined);
    setSelectedDistrict(undefined);
  };

  const handleBack = () => {
    if (currentLevel === "facility") {
      setCurrentLevel("district");
      setSelectedDistrict(undefined);
      return;
    }
    if (currentLevel === "district") {
      resetToNational();
    }
  };

  const openPatients = (facility: string) => {
    setSelectedPatientFacility(facility);
    setPatientsOpen(true);
  };

  const handleItemClick = (item: RankingBarItem) => {
    if (item.canDrillDown === false) return;

    if (currentLevel === "province") {
      setSelectedProvince(item.label);
      setSelectedDistrict(undefined);
      setCurrentLevel("district");
      return;
    }

    if (currentLevel === "district") {
      setSelectedDistrict(item.label);
      setCurrentLevel("facility");
      return;
    }

    openPatients(item.label);
  };

  return (
    <>
      <ReportCardShell
        cardHeight={cardHeight}
        contentHeight={REPORT_CONTENT_HEIGHTS.medium}
        error={error}
        loading={loading}
        onDatesChange={handleDatesChange}
        reportActions={{
          cardId: `${slugify(title)}-geo-drilldown`,
          cardTitle: title,
          dateRange,
          documentation: {
            title,
            description: `${subtitle} Clique numa barra para desagregar por distrito, unidade sanitária e pacientes.`,
            dataSource: "API OpenLDR.",
            endpoint: "/hiv/vl/facilities/* e /hiv/vl/patients/by_facility/",
            interpretation: "O cartão mantém a mesma métrica ao navegar por província, distrito e unidade sanitária.",
            limitations: "A lista de pacientes só abre ao clicar numa unidade sanitária e depende das permissões da API.",
          },
          drillDownDescription: "Clique numa barra para desagregar por distrito, unidade sanitária e pacientes.",
          drillDownRows: [
            { id: "level", label: "Nível atual", value: levelLabel(currentLevel) },
            { id: "breadcrumb", label: "Caminho", value: breadcrumb },
          ],
          drillDownTitle: `Detalhes - ${title}`,
          enableDateFilter: true,
          enableFeedback: true,
          module: "viral-load",
          page: "clinic",
        }}
        subtitle={subtitleWithBreadcrumb}
        title={title}
      >
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
          <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 1.2, minHeight: 28 }}>
            <Typography color="text.secondary" fontSize={12.5} fontWeight={750} noWrap title={breadcrumb}>
              {breadcrumb}
            </Typography>
            {currentLevel !== "province" ? (
              <Stack direction="row" spacing={0.75}>
                <Button onClick={handleBack} size="small" startIcon={reportActionIcons.resetFilters} variant="outlined">
                  Voltar
                </Button>
                <Button onClick={resetToNational} size="small" variant="outlined">
                  Repor nível nacional
                </Button>
              </Stack>
            ) : null}
          </Stack>
          <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
            {levelSubtitle(subtitle, currentLevel)}
          </Typography>
          <RankingBarList
            colorVariant={colorVariant}
            emptyLabel={emptyLabel}
            height={220}
            items={items}
            loading={loading}
            maxVisibleItems={8}
            onItemClick={handleItemClick}
            valueFormatter={(value) => `${formatNumber(value)}${valueSuffix}`}
          />
        </Box>
      </ReportCardShell>
      <ViralLoadPatientDrilldownDialog
        district={selectedDistrict}
        facility={selectedPatientFacility}
        interval={interval}
        onClose={() => setPatientsOpen(false)}
        open={patientsOpen}
        province={selectedProvince}
      />
    </>
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

function levelLabel(level: GeoDrilldownInCardLevel) {
  const labels: Record<GeoDrilldownInCardLevel, string> = {
    district: "Distrito",
    facility: "Unidade Sanitária",
    province: "Província",
  };
  return labels[level];
}

function levelSubtitle(subtitle: string, level: GeoDrilldownInCardLevel) {
  if (level === "district") return subtitle.replace("Província", "Distrito");
  if (level === "facility") return subtitle.replace("Província", "Unidade Sanitária").replace("Distrito", "Unidade Sanitária");
  return subtitle;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
