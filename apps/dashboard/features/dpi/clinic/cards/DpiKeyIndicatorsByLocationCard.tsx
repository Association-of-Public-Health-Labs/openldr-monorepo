"use client";

import { useCallback } from "react";
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { REPORT_CARD_HEIGHTS, REPORT_CONTENT_HEIGHTS, ReportCardShell, ReportEmptyState } from "../../../shared/reporting";
import { fetchDpiFacilityKeyIndicators } from "../../api/facilities";
import type { DpiFacilityRequest, DpiLocationMetric } from "../../types/facility";
import { formatDpiClinicNumber, useDpiClinicCardData } from "./DpiClinicCardUtils";

export function DpiKeyIndicatorsByLocationCard() {
  const loader = useCallback((options: DpiFacilityRequest) => fetchDpiFacilityKeyIndicators(options), []);
  const { data, error, intervalLabel, loading } = useDpiClinicCardData<DpiLocationMetric[]>(
    loader,
    "Não foi possível carregar os indicadores-chave por local.",
  );
  const rows = [...(data ?? [])].sort((a, b) => b.registered - a.registered);

  return (
    <ReportCardShell
      cardHeight={REPORT_CARD_HEIGHTS.table}
      contentHeight={REPORT_CONTENT_HEIGHTS.table}
      error={error}
      loading={loading}
      subtitle={intervalLabel}
      title="Indicadores-chave por local"
    >
      {rows.length ? (
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
                <TableCell sx={{ fontWeight: 900, minWidth: 180 }}>Província</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Registadas</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Testadas</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Rejeitadas</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Positivas</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Negativas</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Pendentes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow hover key={row.locationKey}>
                  <TableCell sx={{ fontWeight: 850, whiteSpace: "nowrap" }}>{row.locationName}</TableCell>
                  <TableCell align="right">{formatDpiClinicNumber(row.registered)}</TableCell>
                  <TableCell align="right">{formatDpiClinicNumber(row.tested)}</TableCell>
                  <TableCell align="right">{formatDpiClinicNumber(row.rejected)}</TableCell>
                  <TableCell align="right">{formatDpiClinicNumber(row.positive)}</TableCell>
                  <TableCell align="right">{formatDpiClinicNumber(row.negative)}</TableCell>
                  <TableCell align="right">{formatDpiClinicNumber(row.pending)}</TableCell>
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
