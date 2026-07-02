"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Box, MenuItem, Select, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  MonthlyBarChart,
  MonthlyChartLegend,
  MonthlyStackedBarChart,
  RankingBarList,
  REPORT_CARD_HEIGHTS,
  REPORT_CONTENT_HEIGHTS,
  ReportCardShell,
  ReportDrillDownDialog,
  ReportEmptyState,
  getReportColor,
} from "../../../shared/reporting";
import type { MonthlyStackedBarPoint, MonthlyStackedBarSegment, RankingBarItem, ReportColorVariant, ReportDrillDownContext, ReportDrillDownRow } from "../../../shared/reporting";
import { formatReportDateRangeLabel, formatReportIntervalDates, getDefaultReportDateInterval } from "../../../shared/reporting/dateRange";
import type { DpiEquipmentMonthlyPoint, DpiLabMetric, DpiLabMonthlyMetric, DpiLabTatMetric, DpiLabTatSamplesPoint, DpiLaboratoryRequest } from "../../types/laboratory";
import { formatDpiLabNumber, useDpiLabCardData } from "./DpiLabCardUtils";

type Loader<T> = (options: DpiLaboratoryRequest) => Promise<T>;

export function DpiLabRankingCard<T extends DpiLabMetric[] | DpiLabTatMetric[]>({
  colorVariant = "success",
  load,
  metric = "total",
  subtitle,
  title,
  valueSuffix = "",
}: {
  colorVariant?: ReportColorVariant;
  load: Loader<T>;
  metric?: "rejected" | "tatAvg" | "total";
  subtitle: string;
  title: string;
  valueSuffix?: string;
}) {
  const stableLoad = useCallback(load, [load]);
  const { data, error, intervalLabel, loading } = useDpiLabCardData<T>(
    stableLoad,
    `Não foi possível carregar ${title.toLowerCase()}.`,
  );
  const rows = [...((data ?? []) as Array<DpiLabMetric | DpiLabTatMetric>)].sort((a, b) => getValue(b) - getValue(a));
  const items = rows.map((row): RankingBarItem => ({
    key: row.labKey,
    label: row.labName,
    level: "facility",
    value: getValue(row),
  }));

  function getValue(row: DpiLabMetric | DpiLabTatMetric) {
    if (metric === "tatAvg" && "tatAvg" in row) return row.tatAvg;
    if (metric === "rejected" && "rejected" in row) return row.rejected || row.total;
    return row.total;
  }

  return (
    <ReportCardShell cardHeight={REPORT_CARD_HEIGHTS.medium} contentHeight={REPORT_CONTENT_HEIGHTS.medium} error={error} loading={loading} subtitle={intervalLabel} title={title}>
      <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
        <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
          {subtitle}
        </Typography>
        <RankingBarList
          colorVariant={colorVariant}
          height={250}
          items={items}
          maxVisibleItems={8}
          valueFormatter={(value) => `${formatDpiLabNumber(value)}${valueSuffix}`}
        />
      </Box>
    </ReportCardShell>
  );
}

export function DpiLabMonthlyCard({
  colorVariant = "info",
  load,
  metric = "total",
  title,
}: {
  colorVariant?: ReportColorVariant;
  load: Loader<DpiLabMonthlyMetric[]>;
  metric?: "registered" | "rejected" | "tested" | "total";
  title: string;
}) {
  const stableLoad = useCallback(load, [load]);
  const { data, error, intervalLabel, loading } = useDpiLabCardData<DpiLabMonthlyMetric[]>(
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
          valueFormatter={formatDpiLabNumber}
        />
      ) : (
        <ReportEmptyState />
      )}
    </ReportCardShell>
  );
}

const tatCategories = [
  { label: "Colheita na US a Recepção no Hub", value: 1 },
  { label: "Recepção no Hub a Registo no Hub", value: 2 },
  { label: "Registo no Hub a Recepção no Lab", value: 3 },
  { label: "Recepção no Lab a Registo no Lab", value: 4 },
  { label: "Registo no Lab a Análise", value: 5 },
  { label: "Análise a Validação", value: 6 },
];

export function DpiLabTatSamplesCardBase({ load }: { load: Loader<DpiLabTatSamplesPoint> }) {
  const { getToken } = useAuth();
  const [category, setCategory] = useState(1);
  const [interval] = useState(() => getDefaultReportDateInterval());
  const [data, setData] = useState<DpiLabTatSamplesPoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Sessão expirada. Inicie sessão novamente.");
      const response = await load({ category, interval, labType: "all", token });
      setData(response);
    } catch (cause) {
      if (cause instanceof Error && cause.message === "Sessão expirada. Inicie sessão novamente.") setError(cause.message);
      else setError("Não foi possível carregar o TRL por mês.");
    } finally {
      setLoading(false);
    }
  }, [category, getToken, interval, load]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <ReportCardShell cardHeight={REPORT_CARD_HEIGHTS.medium} contentHeight={REPORT_CONTENT_HEIGHTS.medium} error={error} loading={loading} subtitle={formatReportDateRangeLabel(interval)} title="TRL por mês">
      <Box sx={{ display: "flex", flex: 1, flexDirection: "column", gap: 1.5, minHeight: 0 }}>
        <Select fullWidth onChange={(event) => setCategory(Number(event.target.value))} size="small" value={category} sx={{ maxWidth: 420 }}>
          {tatCategories.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
        {data ? (
          <Box sx={{ display: "grid", gap: 1.25, gridTemplateColumns: { sm: "repeat(2, minmax(0, 1fr))", xs: "1fr" } }}>
            <TatTile label="<7" tone="success" value={data.lessThan7} />
            <TatTile label="7-15" tone="info" value={data.between7And15} />
            <TatTile label="16-21" tone="warning" value={data.between16And21} />
            <TatTile label=">21" tone="error" value={data.greaterThan21} />
            <TatTile label="Sem datas" tone="warning" value={data.noDates} />
          </Box>
        ) : (
          <ReportEmptyState />
        )}
      </Box>
    </ReportCardShell>
  );
}

export function DpiEquipmentMonthlyStackedCard({ load }: { load: Loader<DpiEquipmentMonthlyPoint[]> }) {
  const theme = useTheme();
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<{
    point: MonthlyStackedBarPoint;
    segment?: MonthlyStackedBarSegment;
  } | null>(null);
  const stableLoad = useCallback(load, [load]);
  const { data, error, interval, intervalLabel, loading, setInterval } = useDpiLabCardData<DpiEquipmentMonthlyPoint[]>(
    stableLoad,
    "Não foi possível carregar as amostras por equipamento por mês.",
  );
  const rows = data ?? [];
  const equipmentNames = [...new Set(rows.flatMap((row) => row.equipments.map((item) => item.equipmentName)))];
  const variants: ReportColorVariant[] = ["success", "info", "warning", "secondary", "primary", "error"];
  const chartPoints: MonthlyStackedBarPoint[] = rows.map((row) => ({
    key: row.monthKey,
    label: row.shortMonthLabel,
    segments: equipmentNames.map((name, index) => ({
      colorVariant: variants[index % variants.length],
      key: name,
      label: name,
      value: row.equipments.find((item) => item.equipmentName === name)?.total ?? 0,
    })),
    tooltipLabel: row.monthLabel,
    total: row.total,
  }));
  const selectedContext = buildDpiEquipmentDrillDownContext(selectedDetail, intervalLabel, interval);
  const selectedRows = buildDpiEquipmentDrillDownRows(selectedDetail, intervalLabel);
  const openDrillDown = (point?: MonthlyStackedBarPoint, segment?: MonthlyStackedBarSegment) => {
    setSelectedDetail(point ? { point, segment } : selectedDetail);
    setDrillDownOpen(true);
  };

  return (
    <>
      <ReportCardShell
        cardHeight={REPORT_CARD_HEIGHTS.large}
        contentHeight={REPORT_CONTENT_HEIGHTS.large}
        error={error}
        loading={loading}
        onDatesChange={(dates) => setInterval({ endDate: dates[1], startDate: dates[0] })}
        reportActions={{
          cardId: "dpi-lab-samples-by-equipment-by-month",
          cardTitle: "Amostras por equipamento por mês",
          dateRange: {
            displayLabel: intervalLabel,
            endDateIso: interval.endDate,
            intervalDates: formatReportIntervalDates(interval),
            startDateIso: interval.startDate,
          },
          documentation: {
            title: "Amostras por equipamento por mês",
            description: "Mostra a distribuição mensal de amostras de DPI por equipamento no laboratório.",
            dataSource: "API OpenLDR.",
            endpoint: "/hiv/dpi/laboratory/samples_by_equipment_by_month/",
            interpretation: "Permite comparar volumes mensais e participação de cada equipamento no total.",
            limitations: "Depende do registo correto do equipamento associado a cada amostra.",
          },
          drillDown: selectedContext,
          enableDateFilter: true,
          enableFeedback: true,
          module: "dpi",
          onDrillDownOpen: () => openDrillDown(),
          page: "lab",
        }}
        subtitle={intervalLabel}
        title="Amostras por equipamento por mês"
      >
        {rows.length ? (
          <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
            <MonthlyStackedBarChart
              ariaLabel="Amostras por equipamento por mês, com total mensal e distribuição por equipamento"
              height={274}
              hideValuesOnMobile
              onBarClick={(point) => openDrillDown(point)}
              onSegmentClick={(point, segment) => openDrillDown(point, segment)}
              points={chartPoints}
              showValues
              valueFormatter={formatDpiLabNumber}
            />
            <MonthlyChartLegend
              items={equipmentNames.map((name, index) => ({
                color: getReportColor(theme, variants[index % variants.length]),
                label: name,
              }))}
            />
          </Box>
        ) : (
          <ReportEmptyState />
        )}
      </ReportCardShell>
      <ReportDrillDownDialog
        context={selectedContext}
        description={
          selectedDetail
            ? "Detalhe avançado será ligado na próxima fase. Nesta fase são apresentados os dados já disponíveis no card."
            : "Selecione uma barra ou segmento do gráfico para ver detalhes."
        }
        onClose={() => setDrillDownOpen(false)}
        open={drillDownOpen}
        rows={selectedRows}
        title="Detalhes - Amostras por equipamento por mês"
      />
    </>
  );
}

function buildDpiEquipmentDrillDownContext(
  selectedDetail: { point: MonthlyStackedBarPoint; segment?: MonthlyStackedBarSegment } | null,
  intervalLabel: string,
  interval: { endDate: string; startDate: string },
): ReportDrillDownContext {
  return {
    cardId: "dpi-lab-samples-by-equipment-by-month",
    chartType: "stacked-bar",
    dateRange: {
      displayLabel: intervalLabel,
      endDateIso: interval.endDate,
      intervalDates: formatReportIntervalDates(interval),
      startDateIso: interval.startDate,
    },
    module: "dpi",
    page: "lab",
    selectedDimension: selectedDetail?.segment ? "equipment" : "month",
    selectedLabel: selectedDetail?.segment?.label || selectedDetail?.point.tooltipLabel || selectedDetail?.point.label,
    selectedValue: selectedDetail?.segment?.value ?? selectedDetail?.point.total,
  };
}

function buildDpiEquipmentDrillDownRows(
  selectedDetail: { point: MonthlyStackedBarPoint; segment?: MonthlyStackedBarSegment } | null,
  intervalLabel: string,
): ReportDrillDownRow[] {
  if (!selectedDetail) {
    return [
      {
        id: "status",
        label: "Estado",
        value: "Selecione uma barra, ponto ou item do gráfico para ver detalhes.",
      },
    ];
  }

  return [
    {
      id: "month",
      label: "Mês",
      value: selectedDetail.point.tooltipLabel || selectedDetail.point.label,
    },
    ...(selectedDetail.segment
      ? [
          {
            id: "equipment",
            label: "Equipamento",
            value: selectedDetail.segment.label,
          },
        ]
      : []),
    {
      id: "total",
      label: selectedDetail.segment ? "Total do equipamento" : "Total do mês",
      value: formatDpiLabNumber(selectedDetail.segment?.value ?? selectedDetail.point.total),
    },
    {
      id: "period",
      label: "Período",
      value: intervalLabel,
      description: "Detalhe avançado será ligado na próxima fase.",
    },
  ];
}

function TatTile({ label, tone, value }: { label: string; tone: "error" | "info" | "success" | "warning"; value: number }) {
  return (
    <Box sx={{ bgcolor: "background.default", border: "1px solid", borderColor: "divider", borderRadius: 1.5, p: 1.5 }}>
      <Typography color="text.secondary" fontSize={12} fontWeight={800}>
        {label === "Sem datas" ? label : `${label} dias`}
      </Typography>
      <Typography color={`${tone}.main`} fontSize={24} fontWeight={900} lineHeight={1.15}>
        {formatDpiLabNumber(value)}
      </Typography>
    </Box>
  );
}
