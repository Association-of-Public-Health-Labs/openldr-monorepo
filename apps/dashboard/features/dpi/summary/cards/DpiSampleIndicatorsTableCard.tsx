"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Box, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs } from "@mui/material";
import { REPORT_CARD_HEIGHTS, REPORT_CONTENT_HEIGHTS, ReportCardShell, ReportEmptyState } from "../../../shared/reporting";
import {
  fetchDpiMonthlyPositivity,
  fetchDpiMonthlyRejectedSamples,
  fetchDpiMonthlySamples,
  formatDpiDateInterval,
  getLastTwelveMonths,
} from "../../api/summary";
import type {
  DpiDateInterval,
  DpiLabType,
  DpiMonthlyPositivityPoint,
  DpiMonthlyRejectedPoint,
  DpiMonthlySamplePoint,
} from "../../types/summary";
import { formatNumber } from "./DpiSummaryCardUtils";

type TableMonth = {
  key: string;
  label: string;
  pending: number;
  registered: number;
  rejected: number;
  tested: number;
};

const labTabs: { label: string; value: DpiLabType }[] = [
  { label: "Todas", value: "all" },
  { label: "Convencional", value: "conventional" },
  { label: "POC", value: "poc" },
];

export function DpiSampleIndicatorsTableCard() {
  const { getToken } = useAuth();
  const [labType, setLabType] = useState<DpiLabType>("all");
  const [interval] = useState<DpiDateInterval>(() => getLastTwelveMonths());
  const [months, setMonths] = useState<TableMonth[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Sessão expirada. Inicie sessão novamente.");
      const [registered, tested, rejected] = await Promise.all([
        fetchDpiMonthlySamples({ interval, labType, token }),
        fetchDpiMonthlyPositivity({ interval, labType, token }),
        fetchDpiMonthlyRejectedSamples({ interval, labType, token }),
      ]);
      setMonths(buildRows(registered, tested, rejected));
    } catch (cause) {
      if (cause instanceof Error && cause.message === "Sessão expirada. Inicie sessão novamente.") {
        setError(cause.message);
      } else {
        setError("Não foi possível carregar os principais indicadores das amostras.");
      }
    } finally {
      setLoading(false);
    }
  }, [getToken, interval, labType]);

  useEffect(() => {
    load();
  }, [load]);

  const indicatorRows = useMemo(
    () => [
      { key: "pending", label: "Pendentes" },
      { key: "registered", label: "Registadas" },
      { key: "rejected", label: "Rejeitadas" },
      { key: "tested", label: "Testadas" },
    ] as const,
    [],
  );

  return (
    <ReportCardShell
      cardHeight={REPORT_CARD_HEIGHTS.table}
      contentHeight={REPORT_CONTENT_HEIGHTS.table}
      error={error}
      loading={loading}
      subtitle={formatDpiDateInterval(interval)}
      title="Principais Indicadores das Amostras"
    >
      <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0, minWidth: 0 }}>
        <Tabs
          onChange={(_, value: DpiLabType) => setLabType(value)}
          value={labType}
          variant="scrollable"
          sx={{ borderBottom: "1px solid", borderColor: "divider", minHeight: 38, mb: 1 }}
        >
          {labTabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} sx={{ minHeight: 38, textTransform: "none", fontWeight: 800 }} />
          ))}
        </Tabs>

        {months.length ? (
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              overflow: "auto",
            }}
          >
            <Table size="small" stickyHeader sx={{ minWidth: 860 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900, minWidth: 150 }}>Indicadores</TableCell>
                  {months.map((month) => (
                    <TableCell align="right" key={month.key} sx={{ fontWeight: 900, whiteSpace: "nowrap" }}>
                      {month.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {indicatorRows.map((row) => (
                  <TableRow hover key={row.key}>
                    <TableCell sx={{ fontWeight: 850, whiteSpace: "nowrap" }}>{row.label}</TableCell>
                    {months.map((month) => (
                      <TableCell align="right" key={`${row.key}-${month.key}`} sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                        {formatNumber(month[row.key])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ) : (
          <ReportEmptyState />
        )}
      </Box>
    </ReportCardShell>
  );
}

function buildRows(
  registered: DpiMonthlySamplePoint[],
  tested: DpiMonthlyPositivityPoint[],
  rejected: DpiMonthlyRejectedPoint[],
): TableMonth[] {
  const monthMap = new Map<string, TableMonth>();

  for (const row of registered) {
    monthMap.set(row.monthKey, {
      key: row.monthKey,
      label: row.shortMonthLabel,
      pending: 0,
      registered: row.total,
      rejected: 0,
      tested: 0,
    });
  }

  for (const row of tested) {
    const current = monthMap.get(row.monthKey) ?? {
      key: row.monthKey,
      label: row.shortMonthLabel,
      pending: 0,
      registered: 0,
      rejected: 0,
      tested: 0,
    };
    current.tested = row.total;
    monthMap.set(row.monthKey, current);
  }

  for (const row of rejected) {
    const current = monthMap.get(row.monthKey) ?? {
      key: row.monthKey,
      label: row.shortMonthLabel,
      pending: 0,
      registered: 0,
      rejected: 0,
      tested: 0,
    };
    current.rejected = row.rejected;
    monthMap.set(row.monthKey, current);
  }

  return [...monthMap.values()]
    .map((row) => ({
      ...row,
      pending: Math.max(row.registered - row.tested - row.rejected, 0),
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}
