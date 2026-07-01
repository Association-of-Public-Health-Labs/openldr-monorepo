"use client";

import { Box, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { ReportEmptyState } from "./ReportStates";
import { getReportColor, type ReportColorVariant } from "./visualTokens";

export type MonthlyBarPoint = {
  key: string;
  label: string;
  value: number;
};

export type MonthlyStackedBarSegment = {
  colorVariant: ReportColorVariant;
  key: string;
  label: string;
  value: number;
};

export type MonthlyStackedBarPoint = {
  key: string;
  label: string;
  segments: MonthlyStackedBarSegment[];
  total: number;
};

type MonthlyBarChartProps = {
  colorVariant?: ReportColorVariant;
  height?: number;
  points: MonthlyBarPoint[];
  showValues?: boolean;
  valueFormatter?: (value: number) => string;
};

type MonthlyStackedBarChartProps = {
  height?: number;
  points: MonthlyStackedBarPoint[];
  showValues?: boolean;
  valueFormatter?: (value: number) => string;
};

export function MonthlyBarChart({
  colorVariant = "success",
  height = 238,
  points,
  showValues = true,
  valueFormatter = formatNumber,
}: MonthlyBarChartProps) {
  const theme = useTheme();
  const barColor = getReportColor(theme, colorVariant);
  const maxValue = Math.max(...points.map((point) => point.value), 0);

  if (!points.length) return <ReportEmptyState minHeight={height} />;

  return (
    <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0, minWidth: 0 }}>
      <Box
        sx={{
          alignItems: "end",
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "grid",
          flex: 1,
          gap: { sm: 1.1, xs: 0.7 },
          gridTemplateColumns: `repeat(${points.length}, minmax(14px, 1fr))`,
          minHeight: height,
          minWidth: 0,
          pt: 1,
        }}
      >
        {points.map((point) => {
          const barHeight = maxValue ? Math.max((point.value / maxValue) * 100, 8) : 8;
          return (
            <Box
              key={point.key}
              sx={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
                height: "100%",
                justifyContent: "flex-end",
                minWidth: 0,
                "&:hover .monthly-bar-fill": {
                  filter: "saturate(1.08)",
                  opacity: 1,
                  transform: "translateY(-2px) scaleY(1)",
                },
              }}
            >
              {showValues && (
                <Typography color="text.secondary" fontSize={10.8} fontWeight={800} noWrap>
                  {valueFormatter(point.value)}
                </Typography>
              )}
              <Box
                title={`${point.label}: ${valueFormatter(point.value)}`}
                sx={{
                  bgcolor: barColor,
                  borderRadius: "7px 7px 2px 2px",
                  boxShadow: `0 0 0 1px ${alpha(barColor, theme.palette.mode === "dark" ? 0.22 : 0.12)}`,
                  height: `${barHeight}%`,
                  maxWidth: 34,
                  minHeight: 16,
                  minWidth: 14,
                  opacity: theme.palette.mode === "dark" ? 0.9 : 0.94,
                  transformOrigin: "bottom center",
                  transition: "filter 160ms ease, opacity 160ms ease, transform 160ms ease",
                  width: "72%",
                  "@keyframes monthlyBarGrow": {
                    from: { transform: "scaleY(0)", opacity: 0.45 },
                    to: { transform: "scaleY(1)", opacity: theme.palette.mode === "dark" ? 0.9 : 0.94 },
                  },
                  "@media (prefers-reduced-motion: no-preference)": {
                    animation: "monthlyBarGrow 460ms cubic-bezier(0.22, 1, 0.36, 1)",
                  },
                }}
                className="monthly-bar-fill"
              />
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{
          display: "grid",
          gap: { sm: 1.1, xs: 0.7 },
          gridTemplateColumns: `repeat(${points.length}, minmax(14px, 1fr))`,
          minWidth: 0,
          pt: 1,
        }}
      >
        {points.map((point) => (
          <Typography key={point.key} color="text.secondary" fontSize={11} fontWeight={800} noWrap sx={{ textAlign: "center" }}>
            {point.label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

export function MonthlyStackedBarChart({
  height = 238,
  points,
  showValues = true,
  valueFormatter = formatNumber,
}: MonthlyStackedBarChartProps) {
  const theme = useTheme();
  const maxValue = Math.max(...points.map((point) => point.total), 0);

  if (!points.length) return <ReportEmptyState minHeight={height} />;

  return (
    <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0, minWidth: 0 }}>
      <Box
        sx={{
          alignItems: "end",
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "grid",
          flex: 1,
          gap: { sm: 1.1, xs: 0.7 },
          gridTemplateColumns: `repeat(${points.length}, minmax(14px, 1fr))`,
          minHeight: height,
          minWidth: 0,
          pt: 1,
        }}
      >
        {points.map((point) => {
          const barHeight = maxValue ? Math.max((point.total / maxValue) * 100, 8) : 8;
          return (
            <Box
              key={point.key}
              sx={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
                height: "100%",
                justifyContent: "flex-end",
                minWidth: 0,
                "&:hover .monthly-stacked-bar": {
                  filter: "saturate(1.08)",
                  opacity: 1,
                  transform: "translateY(-2px) scaleY(1)",
                },
              }}
            >
              {showValues && (
                <Typography color="text.secondary" fontSize={10.8} fontWeight={800} noWrap>
                  {valueFormatter(point.total)}
                </Typography>
              )}
              <Box
                title={`${point.label}: ${valueFormatter(point.total)}`}
                sx={{
                  bgcolor: alpha(theme.palette.grey[500], theme.palette.mode === "dark" ? 0.2 : 0.14),
                  borderRadius: "7px 7px 2px 2px",
                  display: "flex",
                  flexDirection: "column-reverse",
                  height: `${barHeight}%`,
                  maxWidth: 34,
                  minHeight: 18,
                  minWidth: 14,
                  opacity: theme.palette.mode === "dark" ? 0.9 : 0.94,
                  overflow: "hidden",
                  transformOrigin: "bottom center",
                  transition: "filter 160ms ease, opacity 160ms ease, transform 160ms ease",
                  width: "72%",
                  "@keyframes monthlyStackedBarGrow": {
                    from: { transform: "scaleY(0)", opacity: 0.45 },
                    to: { transform: "scaleY(1)", opacity: theme.palette.mode === "dark" ? 0.9 : 0.94 },
                  },
                  "@media (prefers-reduced-motion: no-preference)": {
                    animation: "monthlyStackedBarGrow 460ms cubic-bezier(0.22, 1, 0.36, 1)",
                  },
                }}
                className="monthly-stacked-bar"
              >
                {point.segments.map((segment) => (
                  <Box
                    key={segment.key}
                    sx={{
                      bgcolor: getReportColor(theme, segment.colorVariant),
                      height: `${(segment.value / Math.max(point.total, 1)) * 100}%`,
                      minHeight: segment.value ? 3 : 0,
                    }}
                  />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: "grid", gap: { sm: 1.1, xs: 0.7 }, gridTemplateColumns: `repeat(${points.length}, minmax(14px, 1fr))`, minWidth: 0, pt: 1 }}>
        {points.map((point) => (
          <Typography key={point.key} color="text.secondary" fontSize={11} fontWeight={800} noWrap sx={{ textAlign: "center" }}>
            {point.label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

export function MonthlyChartLegend({
  items,
}: {
  items: { color: string; label: string }[];
}) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1.4 }}>
      {items.map((item) => (
        <Box key={item.label} sx={{ alignItems: "center", display: "flex", gap: 0.7 }}>
          <Box sx={{ bgcolor: item.color, borderRadius: 999, height: 8, width: 8 }} />
          <Typography color="text.secondary" fontSize={11.5} fontWeight={800}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 1 }).format(value);
}
