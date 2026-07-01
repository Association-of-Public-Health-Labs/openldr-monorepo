"use client";

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
  hasSearched: boolean;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  pagination: ViralLoadPatientsPagination;
  rows: ViralLoadPatientRecord[];
};

const columns = [
  "Nome",
  "NID / Identificador",
  "Unidade Sanitária",
  "Província",
  "Distrito",
  "Data da amostra",
  "Data do resultado",
  "Resultado",
  "Carga viral",
  "Motivo de teste",
  "Estado",
] as const;

export function ViralLoadPatientsTable({
  hasSearched,
  loading,
  onPageChange,
  onPerPageChange,
  pagination,
  rows,
}: ViralLoadPatientsTableProps) {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: "grid", flex: 1, gap: 1.1, minHeight: 0 }}>
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} animation="wave" height={42} variant="rounded" />
        ))}
      </Box>
    );
  }

  if (!rows.length) {
    return <ViralLoadPatientEmptyState hasSearched={hasSearched} />;
  }

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
          minHeight: 260,
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
        <Table stickyHeader size="small" sx={{ minWidth: 1180 }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column}
                  sx={{
                    bgcolor: "background.paper",
                    color: "text.secondary",
                    fontSize: 11.5,
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                  }}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
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
                <TableCell>
                  <Typography fontSize={12.5} fontWeight={900}>
                    {row.patientName}
                  </Typography>
                </TableCell>
                <CompactCell>{row.patientIdentifier || "—"}</CompactCell>
                <CompactCell>{row.facility || "—"}</CompactCell>
                <CompactCell>{row.province || "—"}</CompactCell>
                <CompactCell>{row.district || "—"}</CompactCell>
                <CompactCell>{row.sampleDate}</CompactCell>
                <CompactCell>{row.resultDate}</CompactCell>
                <TableCell>
                  <Chip
                    label={row.resultType || "—"}
                    size="small"
                    sx={{
                      bgcolor: alpha(resultColor(theme, row.resultType), theme.palette.mode === "dark" ? 0.18 : 0.12),
                      color: resultColor(theme, row.resultType),
                      fontSize: 11.5,
                      fontWeight: 900,
                    }}
                  />
                </TableCell>
                <CompactCell>{row.viralLoad}</CompactCell>
                <CompactCell>{row.testReason || "—"}</CompactCell>
                <CompactCell>{row.status || "—"}</CompactCell>
              </TableRow>
            ))}
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
        page={Math.max(pagination.page - 1, 0)}
        rowsPerPage={pagination.perPage}
        rowsPerPageOptions={[10, 25, 50]}
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

function CompactCell({ children }: { children: string }) {
  return (
    <TableCell sx={{ color: "text.secondary", fontSize: 12.2, fontWeight: 700, maxWidth: 180 }}>
      <Typography component="span" fontSize="inherit" fontWeight="inherit" noWrap title={children}>
        {children}
      </Typography>
    </TableCell>
  );
}

function resultColor(theme: Theme, resultType: string) {
  return resultType.toLowerCase().includes("não") ? getReportColor(theme, "warning") : getReportColor(theme, "success");
}
