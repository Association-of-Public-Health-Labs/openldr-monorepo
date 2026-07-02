"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Box, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { adaptViralSuppressionByMonth } from "../../adapters/summary";
import { getVlViralSuppressionByMonth } from "../../api/summary";
import type { ViralLoadDateInterval } from "../../types/common";
import { formatViralLoadInterval, getDefaultViralLoadInterval } from "../../types/common";
import type { ViralSuppressionMonthly } from "../../types/summary";
import { ReportDrillDownDialog, formatReportIntervalDates, getReportColor } from "../../../shared/reporting";
import type { ReportDrillDownContext, ReportDrillDownRow } from "../../../shared/reporting";
import { EmptyViralLoadState, ViralLoadCardShell } from "./ViralLoadCardShell";

export function ViralSuppressionTrendCard() {
  const { getToken } = useAuth();
  const theme = useTheme();
  const [interval, setInterval] = useState<ViralLoadDateInterval>(() => getDefaultViralLoadInterval());
  const [rows, setRows] = useState<ViralSuppressionMonthly[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<ViralSuppressionMonthly | null>(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);
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
        const response = await getVlViralSuppressionByMonth({ interval, token });
        if (alive) setRows(adaptViralSuppressionByMonth(response));
      } catch (cause) {
        if (alive) setError(cause instanceof Error ? cause.message : "Não foi possível carregar a supressão viral.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadData();
    return () => {
      alive = false;
    };
  }, [getToken, interval]);

  const averageRate = rows.length
    ? Math.round((rows.reduce((sum, row) => sum + row.suppressionRate, 0) / rows.length) * 10) / 10
    : 0;
  const visibleRows = rows.slice(-12);
  const hiddenRows = Math.max(rows.length - visibleRows.length, 0);
  const suppressionColor = getReportColor(theme, "success");
  const drillDownContext = buildSuppressionTrendContext(selectedPoint, interval);
  const drillDownRows = buildSuppressionTrendRows(selectedPoint, interval);
  const openDrillDown = (point?: ViralSuppressionMonthly | null) => {
    setSelectedPoint(point ?? selectedPoint ?? visibleRows[visibleRows.length - 1] ?? null);
    setDrillDownOpen(true);
  };

  return (
    <>
      <ViralLoadCardShell
        cardHeight={430}
        contentHeight={310}
        error={error}
        interval={interval}
        loading={loading}
        onIntervalChange={setInterval}
        reportActions={{
          cardId: "viral-load-suppression-by-month",
          cardTitle: "Supressão Viral por Mês",
          dateRange: {
            displayLabel: formatViralLoadInterval(interval),
            endDateIso: interval.endDate,
            intervalDates: formatReportIntervalDates(interval),
            startDateIso: interval.startDate,
          },
          documentation: {
            title: "Supressão Viral por Mês",
            description: "Mostra a evolução mensal da taxa de supressão viral.",
            dataSource: "API OpenLDR.",
            endpoint: "/hiv/vl/summary/viral_suppression_by_month/",
            interpretation: "Valores mais altos indicam maior proporção de resultados suprimidos.",
            limitations: "Depende da completude dos resultados enviados ao OpenLDR.",
          },
          drillDown: drillDownContext,
          enableDateFilter: true,
          enableFeedback: true,
          module: "viral-load",
          onDrillDownOpen: () => openDrillDown(),
          page: "summary",
        }}
        title="Supressão Viral por Mês"
      >
        {rows.length ? (
          <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
            <Box sx={{ alignItems: "baseline", display: "flex", flexWrap: "wrap", gap: 1, mb: 1.75 }}>
              <Typography fontSize={26} fontWeight={900} sx={{ lineHeight: 1 }}>
                {averageRate}%
              </Typography>
              <Typography color="text.secondary" fontSize={13} fontWeight={700}>
                Média no período
              </Typography>
            </Box>
            <SuppressionAreaChart
              color={suppressionColor}
              fillColor={alpha(suppressionColor, theme.palette.mode === "dark" ? 0.18 : 0.16)}
              onPointClick={openDrillDown}
              rows={visibleRows}
            />
            <Box sx={{ alignItems: "center", display: "flex", gap: 2, mt: 1.5, flexWrap: "wrap" }}>
              <Legend color={suppressionColor} label="Taxa de supressão" />
              {hiddenRows > 0 && (
                <Typography color="text.secondary" fontSize={12} fontWeight={800}>
                  Últimos {visibleRows.length} meses
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          <EmptyViralLoadState />
        )}
      </ViralLoadCardShell>
      <ReportDrillDownDialog
        context={drillDownContext}
        description={
          selectedPoint
            ? "Detalhe avançado será ligado na próxima fase. Nesta fase são apresentados os dados já disponíveis no card."
            : "Selecione um ponto do gráfico para ver detalhes."
        }
        onClose={() => setDrillDownOpen(false)}
        open={drillDownOpen}
        rows={drillDownRows}
        title="Detalhes - Supressão Viral por Mês"
      />
    </>
  );
}

function SuppressionAreaChart({
  color,
  fillColor,
  onPointClick,
  rows,
}: {
  color: string;
  fillColor: string;
  onPointClick?: (row: ViralSuppressionMonthly) => void;
  rows: ViralSuppressionMonthly[];
}) {
  const width = 760;
  const height = 244;
  const padding = { bottom: 36, left: 30, right: 20, top: 22 };
  const values = rows.map((row) => row.suppressionRate);
  const minValue = Math.max(0, Math.floor(Math.min(...values, 100) - 2));
  const maxValue = Math.min(100, Math.ceil(Math.max(...values, 0) + 2));
  const range = Math.max(maxValue - minValue, 1);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const points = rows.map((row, index) => {
    const x = padding.left + (rows.length === 1 ? plotWidth / 2 : (plotWidth / (rows.length - 1)) * index);
    const y = padding.top + plotHeight - ((row.suppressionRate - minValue) / range) * plotHeight;
    return { ...row, x, y };
  });
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || padding.left} ${height - padding.bottom} L ${points[0]?.x || padding.left} ${height - padding.bottom} Z`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => padding.top + plotHeight * ratio);

  return (
    <Box sx={{ color: "text.primary", flex: 1, minHeight: 0, minWidth: 0 }}>
      <svg aria-label="Supressão viral por mês" role="img" style={{ display: "block", height: "100%", minHeight: 250, width: "100%" }} viewBox={`0 0 ${width} ${height}`}>
        {gridLines.map((y) => (
          <line key={y} stroke="currentColor" strokeOpacity={0.08} x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
        ))}
        <path d={areaPath} fill={fillColor} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          style={{
            transition: "opacity 160ms ease",
          }}
        />
        {points.map((point, index) => {
          const labelOffset = index % 2 === 0 ? -11 : -20;
          return (
          <g
            aria-label={`${point.monthLabel}: ${point.suppressionRate}%`}
            key={point.monthKey}
            onClick={onPointClick ? () => onPointClick(point) : undefined}
            onKeyDown={
              onPointClick
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onPointClick(point);
                    }
                  }
                : undefined
            }
            role={onPointClick ? "button" : undefined}
            style={{ cursor: onPointClick ? "pointer" : "default", outline: "none" }}
            tabIndex={onPointClick ? 0 : undefined}
          >
            <circle cx={point.x} cy={point.y} fill={color} r={4} stroke="white" strokeWidth={2}>
              <title>{`${point.month}: ${point.suppressionRate}%`}</title>
            </circle>
            <text fill="currentColor" fontSize={10.8} fontWeight={800} textAnchor="middle" x={point.x} y={Math.max(12, point.y + labelOffset)}>
              {point.suppressionRate}%
            </text>
            <text fill="currentColor" fontSize={12} opacity={0.58} textAnchor="middle" x={point.x} y={height - 10}>
              {point.month}
            </text>
          </g>
          );
        })}
      </svg>
    </Box>
  );
}

function buildSuppressionTrendContext(
  point: ViralSuppressionMonthly | null,
  interval: ViralLoadDateInterval,
): ReportDrillDownContext {
  return {
    cardId: "viral-load-suppression-by-month",
    chartType: "area",
    dateRange: {
      displayLabel: formatViralLoadInterval(interval),
      endDateIso: interval.endDate,
      intervalDates: formatReportIntervalDates(interval),
      startDateIso: interval.startDate,
    },
    module: "viral-load",
    page: "summary",
    selectedDimension: "month",
    selectedLabel: point?.monthLabel,
    selectedValue: point?.suppressionRate,
  };
}

function buildSuppressionTrendRows(
  point: ViralSuppressionMonthly | null,
  interval: ViralLoadDateInterval,
): ReportDrillDownRow[] {
  if (!point) {
    return [
      {
        id: "status",
        label: "Estado",
        value: "Selecione uma barra, ponto ou item do gráfico para ver detalhes.",
      },
    ];
  }

  return [
    { id: "month", label: "Mês", value: point.monthLabel },
    { id: "period", label: "Período", value: formatViralLoadInterval(interval) },
    { id: "rate", label: "Taxa de supressão", value: `${point.suppressionRate}%` },
    { id: "total", label: "Total de amostras com resultado", value: formatNumber(point.total) },
    { id: "suppressed", label: "Suprimidos", value: formatNumber(point.suppressed) },
    {
      id: "not-suppressed",
      label: "Não suprimidos",
      value: formatNumber(point.notSuppressed),
      description: "Detalhe avançado será ligado na próxima fase.",
    },
  ];
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ alignItems: "center", display: "flex", gap: 0.75 }}>
      <Box sx={{ bgcolor: color, borderRadius: 999, height: 8, width: 8 }} />
      <Typography color="text.secondary" fontSize={12} fontWeight={800}>
        {label}
      </Typography>
    </Box>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-MZ").format(value);
}
