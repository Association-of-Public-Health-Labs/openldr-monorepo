"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Alert,
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Button } from "@repo/design_system/app/atoms/inputs/Button";
import { Dialog } from "@repo/design_system/app/atoms/modals/Dialog";
import { reportActionIcons } from "../../../shared/reporting";
import { searchPatientsByFacility } from "../../api/patients";
import type { ViralLoadDateInterval } from "../../types/common";
import type {
  ViralLoadPatientDrilldownFilters,
  ViralLoadPatientRecord,
  ViralLoadPatientsPagination,
} from "../../types/patients";
import { ViralLoadPatientsTable } from "./ViralLoadPatientsTable";

type ViralLoadPatientDrilldownDialogProps = {
  district?: string;
  facility?: string;
  interval: ViralLoadDateInterval;
  onClose: () => void;
  open: boolean;
  province?: string;
};

const initialFilters: ViralLoadPatientDrilldownFilters = {
  identifier: "",
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

const resultOptions = [
  { label: "Todos", value: "" },
  { label: "Suprimido", value: "suppressed" },
  { label: "Não suprimido", value: "not_suppressed" },
  { label: "Indetectável", value: "undetectable" },
  { label: "Sem resultado", value: "no_result" },
] as const;

const testReasonOptions = [
  { label: "Todos", value: "" },
  { label: "Rotina", value: "routine" },
  { label: "Repetição", value: "repeat" },
  { label: "Suspeita de falha terapêutica", value: "suspected_treatment_failure" },
  { label: "Não especificado", value: "reason_not_specified" },
] as const;

export function ViralLoadPatientDrilldownDialog({
  district,
  facility,
  interval,
  onClose,
  open,
  province,
}: ViralLoadPatientDrilldownDialogProps) {
  const { getToken } = useAuth();
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [filters, setFilters] = useState<ViralLoadPatientDrilldownFilters>(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState<ViralLoadPatientDrilldownFilters>(initialFilters);
  const [rows, setRows] = useState<ViralLoadPatientRecord[]>([]);
  const [pagination, setPagination] = useState<ViralLoadPatientsPagination>(initialPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumb = [province, district, facility].filter(Boolean).join(" → ");

  useEffect(() => {
    if (!open) return;
    setFilters(initialFilters);
    setDebouncedFilters(initialFilters);
    setRows([]);
    setPagination(initialPagination);
    setError(null);
    window.setTimeout(() => nameInputRef.current?.focus(), 80);
  }, [open, facility, district, province]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedFilters(filters);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [filters]);

  const loadPage = useCallback(
    async (page: number, perPage: number) => {
      if (!open || !facility) return;

      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        if (!token) throw new Error("Sessão expirada. Inicie sessão novamente.");
        const result = await searchPatientsByFacility({
          district,
          facility,
          interval,
          page,
          perPage,
          province,
          token,
        });

        if (result.ok === false) {
          setRows([]);
          setPagination(result.pagination);
          setError(normalizePatientError(result.error));
          return;
        }

        setRows(result.data);
        setPagination(result.pagination);
      } catch (cause) {
        if (process.env.NODE_ENV === "development") console.error(cause);
        setRows([]);
        setPagination((current) => ({ ...current, page, perPage, totalCount: 0, totalPages: 0 }));
        setError("Não foi possível carregar os pacientes. Tente novamente.");
      } finally {
        setLoading(false);
      }
    },
    [district, facility, getToken, interval, open, province],
  );

  useEffect(() => {
    if (!open || !facility) return;
    loadPage(pagination.page, pagination.perPage);
  }, [facility, loadPage, open, pagination.page, pagination.perPage]);

  const filteredRows = useMemo(() => {
    // The facility endpoint is the only endpoint that preserves the selected geographic context.
    // Until the API supports combined patient filters on /by_facility/, modal filters are applied
    // client-side to the currently loaded facility page.
    return rows.filter((row) => {
      if (debouncedFilters.name && !includesText(row.patientName, debouncedFilters.name)) return false;
      if (debouncedFilters.identifier && !includesText(row.patientIdentifier, debouncedFilters.identifier)) return false;
      if (debouncedFilters.resultType && !matchesResult(row.viralLoadResultCategory, debouncedFilters.resultType)) return false;
      if (debouncedFilters.testReason && !matchesTestReason(row.testReason, debouncedFilters.testReason)) return false;
      return true;
    });
  }, [debouncedFilters, rows]);

  const handleFilterChange = (field: keyof ViralLoadPatientDrilldownFilters, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPagination((current) => ({ ...current, page: 1 }));
  };

  return (
    <Dialog
      aria-labelledby="vl-patient-drilldown-dialog-title"
      fullWidth
      maxWidth="xl"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          height: "85vh",
          maxHeight: "85vh",
          width: { md: "88vw", xs: "96vw" },
        },
      }}
    >
      <DialogTitle id="vl-patient-drilldown-dialog-title" sx={{ pb: 1.4 }}>
        <Stack spacing={0.35}>
          <Typography component="span" fontSize={20} fontWeight={900}>
            Pacientes por unidade sanitária
          </Typography>
          {breadcrumb ? (
            <Typography color="text.secondary" fontSize={12.5} fontWeight={800}>
              {breadcrumb}
            </Typography>
          ) : null}
        </Stack>
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
          px: { sm: 3, xs: 2 },
        }}
      >
        <PatientDrilldownFilters filters={filters} inputRef={nameInputRef} loading={loading} onChange={handleFilterChange} />
        {error ? <Alert severity="warning" sx={{ mb: 1.4 }}>{error}</Alert> : null}
        <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
          <ViralLoadPatientsTable
            emptyLabel="Nenhum paciente encontrado para os filtros aplicados."
            hasSearched
            includeStatus={false}
            loading={loading}
            maxTableHeight="100%"
            minTableHeight={260}
            onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
            onPerPageChange={(perPage) => setPagination((current) => ({ ...current, page: 1, perPage }))}
            pagination={pagination}
            rows={filteredRows}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ flex: "0 0 auto", px: 3, py: 2 }}>
        <Button onClick={onClose} startIcon={reportActionIcons.close} variant="outlined">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PatientDrilldownFilters({
  filters,
  inputRef,
  loading,
  onChange,
}: {
  filters: ViralLoadPatientDrilldownFilters;
  inputRef: RefObject<HTMLInputElement>;
  loading: boolean;
  onChange: (field: keyof ViralLoadPatientDrilldownFilters, value: string) => void;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.2,
        gridTemplateColumns: { lg: "1.2fr 0.9fr 0.9fr 1fr", md: "1fr 1fr", xs: "1fr" },
        mb: 1.4,
      }}
    >
      <TextField
        inputRef={inputRef}
        disabled={loading}
        fullWidth
        label="Nome do paciente"
        onChange={(event) => onChange("name", event.target.value)}
        placeholder="Pesquisar por nome do paciente..."
        size="small"
        value={filters.name}
      />
      <FormControl fullWidth size="small">
        <InputLabel>Resultado</InputLabel>
        <Select
          disabled={loading}
          label="Resultado"
          onChange={(event) => onChange("resultType", event.target.value)}
          value={filters.resultType}
        >
          {resultOptions.map((option) => (
            <MenuItem key={option.value || "all-results"} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel>Motivo de teste</InputLabel>
        <Select
          disabled={loading}
          label="Motivo de teste"
          onChange={(event) => onChange("testReason", event.target.value)}
          value={filters.testReason}
        >
          {testReasonOptions.map((option) => (
            <MenuItem key={option.value || "all-test-reasons"} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        disabled={loading}
        fullWidth
        label="Identificador/NID"
        onChange={(event) => onChange("identifier", event.target.value)}
        placeholder="Pesquisar por NID/identificador..."
        size="small"
        value={filters.identifier}
      />
    </Box>
  );
}

function includesText(value: string | null | undefined, query: string) {
  return normalizeText(value).includes(normalizeText(query));
}

function matchesResult(value: string | null | undefined, filter: string) {
  const normalized = normalizeText(value);
  if (filter === "suppressed") return normalized.includes("suprimido") && !normalized.includes("nao");
  if (filter === "not_suppressed") return normalized.includes("nao suprimido") || normalized.includes("not suppressed");
  if (filter === "undetectable") return normalized.includes("indetectavel") || normalized.includes("undetectable");
  if (filter === "no_result") return !value || value === "—" || normalized.includes("sem resultado") || normalized.includes("no result");
  return true;
}

function matchesTestReason(value: string | null | undefined, filter: string) {
  const normalized = normalizeText(value);
  if (filter === "routine") return normalized.includes("rotina") || normalized.includes("routine");
  if (filter === "repeat") return normalized.includes("repeticao") || normalized.includes("repeat");
  if (filter === "suspected_treatment_failure") {
    return normalized.includes("suspeita de falha terapeutica") || normalized.includes("suspected treatment failure");
  }
  if (filter === "reason_not_specified") {
    return !value || value === "—" || normalized.includes("nao especificado") || normalized.includes("reason not specified");
  }
  return true;
}

function normalizeText(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizePatientError(error: string) {
  const lower = error.toLowerCase();
  if (lower.includes("sem permissão") || lower.includes("forbidden") || lower.includes("unauthorized") || lower.includes("403")) {
    return "Não tem permissão para visualizar dados de pacientes desta unidade sanitária.";
  }
  return "Não foi possível carregar os pacientes. Tente novamente.";
}
