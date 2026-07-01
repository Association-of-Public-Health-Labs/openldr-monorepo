"use client";

import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { Search } from "lucide-react";
import type { ViralLoadPatientSearchFilters, ViralLoadPatientSearchMode } from "../../types/patients";

export const VL_RESULT_TYPE_OPTIONS = [
  { label: "Suprimido", value: "suppressed" },
  { label: "Não suprimido", value: "not_suppressed" },
] as const;

export const VL_TEST_REASON_OPTIONS = [
  { label: "Rotina", value: "routine" },
  { label: "Repetição", value: "repeat" },
  { label: "Suspeita de falha terapêutica", value: "suspected_treatment_failure" },
  { label: "Não especificado", value: "reason_not_specified" },
] as const;

type ViralLoadPatientFiltersProps = {
  filters: ViralLoadPatientSearchFilters;
  loading: boolean;
  mode: ViralLoadPatientSearchMode;
  onChange: (field: keyof ViralLoadPatientSearchFilters, value: string) => void;
  onSearch: () => void;
};

export function ViralLoadPatientFilters({
  filters,
  loading,
  mode,
  onChange,
  onSearch,
}: ViralLoadPatientFiltersProps) {
  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
      sx={{
        alignItems: "center",
        display: "grid",
        gap: 1.4,
        gridTemplateColumns: { md: "minmax(0, 1fr) auto", xs: "1fr" },
        mb: 2.2,
      }}
    >
      {mode === "facility" && (
        <TextField
          fullWidth
          label="Unidade Sanitária"
          onChange={(event) => onChange("facility", event.target.value)}
          placeholder="Escreva o nome da unidade sanitária"
          size="small"
          value={filters.facility}
        />
      )}

      {mode === "name" && (
        <TextField
          fullWidth
          label="Nome do paciente"
          onChange={(event) => onChange("name", event.target.value)}
          placeholder="Escreva o nome ou apelido"
          size="small"
          value={filters.name}
        />
      )}

      {mode === "result_type" && (
        <FormControl fullWidth size="small">
          <InputLabel>Tipo de resultado</InputLabel>
          <Select
            label="Tipo de resultado"
            onChange={(event) => onChange("resultType", event.target.value)}
            value={filters.resultType}
          >
            {VL_RESULT_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {mode === "test_reason" && (
        <FormControl fullWidth size="small">
          <InputLabel>Motivo de teste</InputLabel>
          <Select
            label="Motivo de teste"
            onChange={(event) => onChange("testReason", event.target.value)}
            value={filters.testReason}
          >
            {VL_TEST_REASON_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Button
        disabled={loading}
        startIcon={<Search size={17} />}
        type="submit"
        variant="contained"
        sx={{
          borderRadius: 1.5,
          fontWeight: 900,
          minHeight: 40,
          px: 2.4,
          textTransform: "none",
          whiteSpace: "nowrap",
        }}
      >
        Pesquisar
      </Button>
    </Box>
  );
}
