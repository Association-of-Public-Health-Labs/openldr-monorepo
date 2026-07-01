"use client";

import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Box, Typography } from "@mui/material";
import { REPORT_CARD_HEIGHTS, REPORT_CONTENT_HEIGHTS, ReportCardShell } from "../../../shared/reporting";
import {
  searchPatientsByFacility,
  searchPatientsByName,
  searchPatientsByResultType,
  searchPatientsByTestReason,
} from "../../api/patients";
import type { ViralLoadDateInterval } from "../../types/common";
import { formatViralLoadInterval, getDefaultViralLoadInterval } from "../../types/common";
import type {
  ViralLoadPatientRecord,
  ViralLoadPatientSearchFilters,
  ViralLoadPatientSearchMode,
  ViralLoadPatientsPagination,
} from "../../types/patients";
import { ViralLoadPatientErrorState } from "./ViralLoadPatientErrorState";
import { ViralLoadPatientFilters } from "./ViralLoadPatientFilters";
import { ViralLoadPatientSearchTabs } from "./ViralLoadPatientSearchTabs";
import { ViralLoadPatientsTable } from "./ViralLoadPatientsTable";

const initialFilters: ViralLoadPatientSearchFilters = {
  facility: "",
  name: "",
  resultType: "",
  testReason: "",
};

const initialPagination: ViralLoadPatientsPagination = {
  page: 1,
  perPage: 25,
  totalCount: 0,
  totalPages: 0,
};

export function ViralLoadPatientSearchCard() {
  const { getToken } = useAuth();
  const [mode, setMode] = useState<ViralLoadPatientSearchMode>("facility");
  const [filters, setFilters] = useState<ViralLoadPatientSearchFilters>(initialFilters);
  const [interval] = useState<ViralLoadDateInterval>(() => getDefaultViralLoadInterval());
  const [rows, setRows] = useState<ViralLoadPatientRecord[]>([]);
  const [pagination, setPagination] = useState<ViralLoadPatientsPagination>(initialPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const subtitle = useMemo(() => {
    if (!hasSearched) return formatViralLoadInterval(interval);
    return `${formatViralLoadInterval(interval)} · ${pagination.totalCount} resultado(s)`;
  }, [hasSearched, interval, pagination.totalCount]);

  const runSearch = useCallback(
    async (page: number, perPage: number) => {
      const validationError = validateSearch(mode, filters);
      if (validationError) {
        setError(validationError);
        return;
      }

      setLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const token = await getToken();
        if (!token) throw new Error("Sessão expirada. Inicie sessão novamente.");

        const baseOptions = { interval, page, perPage, token };
        const result =
          mode === "facility"
            ? await searchPatientsByFacility({ ...baseOptions, facility: filters.facility.trim() })
            : mode === "name"
              ? await searchPatientsByName({ ...baseOptions, name: filters.name.trim() })
              : mode === "result_type"
                ? await searchPatientsByResultType({ ...baseOptions, resultType: filters.resultType })
                : await searchPatientsByTestReason({ ...baseOptions, testReason: filters.testReason });

        if (result.ok === false) {
          setRows([]);
          setPagination(result.pagination);
          setError(result.error);
          return;
        }

        setRows(result.data);
        setPagination(result.pagination);
      } catch (cause) {
        setRows([]);
        setPagination((current) => ({ ...current, page, perPage, totalCount: 0, totalPages: 0 }));
        setError("Não foi possível realizar a pesquisa. Verifique os filtros e tente novamente.");
      } finally {
        setLoading(false);
      }
    },
    [filters, getToken, interval, mode]
  );

  const handleModeChange = useCallback((nextMode: ViralLoadPatientSearchMode) => {
    setMode(nextMode);
    setRows([]);
    setError(null);
    setHasSearched(false);
    setPagination(initialPagination);
  }, []);

  const handleFilterChange = useCallback((field: keyof ViralLoadPatientSearchFilters, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setError(null);
  }, []);

  const handleSearch = useCallback(() => {
    runSearch(1, pagination.perPage);
  }, [pagination.perPage, runSearch]);

  return (
    <ReportCardShell
      cardHeight={720}
      contentHeight={600}
      loading={false}
      scrollable
      subtitle={subtitle}
      title="Resultados de Pacientes"
    >
      <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
        <Typography color="text.secondary" fontSize={12.8} fontWeight={700} sx={{ mb: 1.2 }}>
          Pesquisa de pacientes de Carga Viral nos últimos 12 meses.
        </Typography>
        <ViralLoadPatientSearchTabs onChange={handleModeChange} value={mode} />
        <ViralLoadPatientFilters filters={filters} loading={loading} mode={mode} onChange={handleFilterChange} onSearch={handleSearch} />
        {error ? <ViralLoadPatientErrorState message={error} /> : null}
        <ViralLoadPatientsTable
          hasSearched={hasSearched}
          loading={loading}
          onPageChange={(page) => runSearch(page, pagination.perPage)}
          onPerPageChange={(perPage) => runSearch(1, perPage)}
          pagination={pagination}
          rows={rows}
        />
      </Box>
    </ReportCardShell>
  );
}

function validateSearch(mode: ViralLoadPatientSearchMode, filters: ViralLoadPatientSearchFilters) {
  if (mode === "facility" && !filters.facility.trim()) return "Preencha a Unidade Sanitária.";
  if (mode === "name" && !filters.name.trim()) return "Preencha o nome do paciente.";
  if (mode === "result_type" && !filters.resultType) return "Selecione o tipo de resultado.";
  if (mode === "test_reason" && !filters.testReason) return "Selecione o motivo de teste.";
  return null;
}
