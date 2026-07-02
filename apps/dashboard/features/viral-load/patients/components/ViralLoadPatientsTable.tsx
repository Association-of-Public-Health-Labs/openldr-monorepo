"use client";

import type { ReactNode } from "react";
import {
  Box,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { getReportColor } from "../../../shared/reporting";
import type { ViralLoadPatientRecord, ViralLoadPatientsPagination } from "../../types/patients";
import { ViralLoadPatientEmptyState } from "./ViralLoadPatientEmptyState";

type ViralLoadPatientsTableProps = {
  columnPreset?: "drilldown" | "general";
  emptyLabel?: string;
  hasSearched: boolean;
  includeStatus?: boolean;
  loading: boolean;
  maxTableHeight?: number | string;
  minTableHeight?: number | string;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  pagination: ViralLoadPatientsPagination;
  rows: ViralLoadPatientRecord[];
  rowsPerPageOptions?: number[];
};

type PatientColumn = {
  key: string;
  label: string;
  render: (row: ViralLoadPatientRecord) => ReactNode;
};

export function ViralLoadPatientsTable({
  columnPreset = "general",
  emptyLabel,
  hasSearched,
  includeStatus = true,
  loading,
  maxTableHeight,
  minTableHeight = 260,
  onPageChange,
  onPerPageChange,
  pagination,
  rows,
  rowsPerPageOptions = [10, 25, 50, 100],
}: ViralLoadPatientsTableProps) {
  const theme = useTheme();
  const columns = getColumns(columnPreset, includeStatus);
  const colSpan = columns.length;
  const minWidth = columnPreset === "drilldown" ? 1720 : 1180;

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        display: "flex",
        flex: 1,
        flexDirection: "column",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <TableContainer
        sx={{
          flex: 1,
          maxHeight: maxTableHeight,
          minHeight: minTableHeight,
          minWidth: 0,
          overflow: "auto",
          overflowX: "auto",
          scrollbarColor: "rgba(120, 120, 120, 0.45) transparent",
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            height: 8,
            width: 7,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(120, 120, 120, 0.38)",
            borderRadius: 999,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  sx={{
                    bgcolor: "background.paper",
                    color: "text.secondary",
                    fontSize: 11.5,
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 7 }).map((_, index) => (
                <TableRow key={`patient-loading-${index}`}>
                  <TableCell colSpan={colSpan} sx={{ py: 0.75 }}>
                    <Skeleton animation="wave" height={36} variant="rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow
                  hover
                  key={row.id}
                  sx={{
                    transition: "background-color 160ms ease",
                    "&:hover": {
                      bgcolor: alpha(getReportColor(theme, "info"), theme.palette.mode === "dark" ? 0.09 : 0.055),
                    },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key}>{column.render(row)}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={colSpan} sx={{ borderBottom: 0 }}>
                  <Box sx={{ py: 2 }}>
                    <ViralLoadPatientEmptyState hasSearched={hasSearched} message={emptyLabel} />
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={pagination.totalCount}
        getItemAriaLabel={(type) => {
          const labels = {
            first: "Primeira página",
            last: "Última página",
            next: "Próximo",
            previous: "Anterior",
          };
          return labels[type];
        }}
        labelDisplayedRows={({ count }) =>
          `Página ${pagination.page} de ${Math.max(pagination.totalPages, 1)} · ${count} resultado(s)`
        }
        labelRowsPerPage="Linhas por página"
        onPageChange={(_, page) => onPageChange(page + 1)}
        onRowsPerPageChange={(event) => onPerPageChange(Number(event.target.value))}
        page={pagination.totalCount ? Math.max(pagination.page - 1, 0) : 0}
        rowsPerPage={pagination.perPage}
        rowsPerPageOptions={rowsPerPageOptions}
        showFirstButton
        showLastButton
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          flex: "0 0 auto",
          minHeight: 56,
          overflow: "visible",
          px: { sm: 1.5, xs: 0.5 },
          ".MuiTablePagination-toolbar": {
            alignItems: "center",
            flexWrap: { sm: "nowrap", xs: "wrap" },
            gap: { sm: 1, xs: 0.5 },
            minHeight: 56,
          },
          ".MuiTablePagination-actions": {
            flex: "0 0 auto",
            ml: { sm: 1, xs: 0 },
          },
          ".MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel": {
            fontSize: 12,
            fontWeight: 800,
            m: 0,
          },
        }}
      />
    </Box>
  );
}

function PatientNameCell({ children }: { children: string }) {
  return (
    <Typography fontSize={12.5} fontWeight={900}>
      {displayValue(children)}
    </Typography>
  );
}

function CompactCell({ children }: { children: string }) {
  const value = displayValue(children);
  return (
    <Typography
      color="text.secondary"
      component="span"
      fontSize={12.2}
      fontWeight={700}
      maxWidth={180}
      noWrap
      title={value}
    >
      {value}
    </Typography>
  );
}

function ResultBadge({ value }: { value: string }) {
  const theme = useTheme();
  const color = resultColor(theme, value);
  return (
    <Chip
      label={displayValue(value)}
      size="small"
      sx={{
        bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.18 : 0.12),
        color,
        fontSize: 11.5,
        fontWeight: 900,
      }}
    />
  );
}

function getColumns(preset: "drilldown" | "general", includeStatus: boolean): PatientColumn[] {
  if (preset === "drilldown") {
    return [
      { key: "name", label: "Nome", render: (row) => <PatientNameCell>{row.patientName}</PatientNameCell> },
      { key: "identifier", label: "Identificador", render: (row) => <CompactCell>{row.patientIdentifier}</CompactCell> },
      { key: "age", label: "Idade", render: (row) => <CompactCell>{row.ageInYears}</CompactCell> },
      { key: "requesting-facility", label: "U.S que solicitou", render: (row) => <CompactCell>{row.facility}</CompactCell> },
      { key: "testing-facility", label: "U.S que testou", render: (row) => <CompactCell>{row.testingFacilityName}</CompactCell> },
      { key: "province", label: "Província", render: (row) => <CompactCell>{row.province}</CompactCell> },
      { key: "district", label: "Distrito", render: (row) => <CompactCell>{row.district}</CompactCell> },
      {
        key: "specimen-type",
        label: "Tipo de amostra",
        render: (row) => <CompactCell>{row.specimenSourceDesc || row.specimenSourceCode}</CompactCell>,
      },
      { key: "collection-date", label: "Data da colheita", render: (row) => <CompactCell>{row.specimenDatetime}</CompactCell> },
      { key: "registration-date", label: "Data de registo", render: (row) => <CompactCell>{row.registeredDatetime}</CompactCell> },
      { key: "validation-date", label: "Data de validação", render: (row) => <CompactCell>{row.authorisedDatetime}</CompactCell> },
      { key: "result", label: "Resultado", render: (row) => <ResultBadge value={row.resultType} /> },
      { key: "test-reason", label: "Motivo de teste", render: (row) => <CompactCell>{row.testReason}</CompactCell> },
      {
        key: "rejection-reason",
        label: "Razão da rejeição",
        render: (row) => <CompactCell>{row.rejectionDesc || row.rejectionCode}</CompactCell>,
      },
      { key: "art-regimen", label: "Regime de tratamento", render: (row) => <CompactCell>{row.artRegimen}</CompactCell> },
    ];
  }

  const columns: PatientColumn[] = [
    { key: "name", label: "Nome", render: (row) => <PatientNameCell>{row.patientName}</PatientNameCell> },
    { key: "identifier", label: "NID / Identificador", render: (row) => <CompactCell>{row.patientIdentifier}</CompactCell> },
    { key: "facility", label: "Unidade Sanitária", render: (row) => <CompactCell>{row.facility}</CompactCell> },
    { key: "province", label: "Província", render: (row) => <CompactCell>{row.province}</CompactCell> },
    { key: "district", label: "Distrito", render: (row) => <CompactCell>{row.district}</CompactCell> },
    { key: "sample-date", label: "Data da amostra", render: (row) => <CompactCell>{row.sampleDate}</CompactCell> },
    { key: "result-date", label: "Data do resultado", render: (row) => <CompactCell>{row.resultDate}</CompactCell> },
    { key: "result", label: "Resultado", render: (row) => <ResultBadge value={row.resultType} /> },
    { key: "viral-load", label: "Carga viral", render: (row) => <CompactCell>{row.viralLoad}</CompactCell> },
    { key: "test-reason", label: "Motivo de teste", render: (row) => <CompactCell>{row.testReason}</CompactCell> },
  ];

  if (includeStatus) {
    columns.push({ key: "status", label: "Estado", render: (row) => <CompactCell>{row.status}</CompactCell> });
  }

  return columns;
}

function displayValue(value: string) {
  return value?.trim() || "—";
}

function resultColor(theme: Theme, resultType: string) {
  const normalized = resultType.toLowerCase();
  if (!resultType || resultType === "—" || normalized.includes("sem resultado")) return theme.palette.text.secondary;
  if (normalized.includes("rejeitado") || normalized.includes("rejected")) return getReportColor(theme, "error");
  if (normalized.includes("não") || normalized.includes("not suppressed")) return getReportColor(theme, "warning");
  return getReportColor(theme, "success");
}
