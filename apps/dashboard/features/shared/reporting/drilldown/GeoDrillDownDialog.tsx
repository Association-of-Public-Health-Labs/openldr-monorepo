"use client";

import { Alert, Box, DialogActions, DialogContent, DialogTitle, LinearProgress, Stack, Typography } from "@mui/material";
import { Button } from "@repo/design_system/app/atoms/inputs/Button";
import { Dialog } from "@repo/design_system/app/atoms/modals/Dialog";
import { reportActionIcons } from "../actions";
import type { DemographicDimension, GeoDrillDownContext, GeoDrillDownRow, GeoDrillDownLevel, PatientDrillDownRow } from "./types";
import { GeoDrillDownBreadcrumb } from "./GeoDrillDownBreadcrumb";
import { GeoDrillDownDemographicTabs, type GeoDrillDownTab } from "./GeoDrillDownDemographicTabs";
import { GeoDrillDownPatientsTable } from "./GeoDrillDownPatientsTable";
import { GeoDrillDownRanking } from "./GeoDrillDownRanking";

type GeoDrillDownDialogProps = {
  context: GeoDrillDownContext;
  demographicTabs: GeoDrillDownTab[];
  emptyLabel?: string;
  error?: string | null;
  loading?: boolean;
  onBack: () => void;
  onClose: () => void;
  onDemographicChange: (dimension: DemographicDimension | "patients") => void;
  onNavigateBreadcrumb?: (level: Exclude<GeoDrillDownLevel, "patient">) => void;
  onOpenPatients?: () => void;
  onRowClick?: (row: GeoDrillDownRow) => void;
  open: boolean;
  patients: PatientDrillDownRow[];
  rows: GeoDrillDownRow[];
  selectedTab: DemographicDimension | "patients";
  showPatientsButton?: boolean;
  summary?: {
    label: string;
    value: string | number;
  }[];
  title: string;
};

export function GeoDrillDownDialog({
  context,
  demographicTabs,
  emptyLabel,
  error,
  loading,
  onBack,
  onClose,
  onDemographicChange,
  onNavigateBreadcrumb,
  onOpenPatients,
  onRowClick,
  open,
  patients,
  rows,
  selectedTab,
  showPatientsButton,
  summary = [],
  title,
}: GeoDrillDownDialogProps) {
  const isPatientLevel = context.currentLevel === "patient" || selectedTab === "patients";

  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={onClose}>
      <DialogTitle>
        <Stack alignItems="center" direction="row" spacing={1}>
          {reportActionIcons.drillDown}
          <Typography component="span" fontSize={20} fontWeight={900}>
            {title}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ overflow: "hidden", pt: 1 }}>
        <Stack spacing={2}>
          <GeoDrillDownBreadcrumb
            district={context.district}
            facility={context.facility}
            onNavigate={onNavigateBreadcrumb}
            province={context.province}
          />
          <Box sx={{ color: "text.secondary", display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            <Typography fontSize={12.5} fontWeight={800}>
              Período: {context.dateRange?.displayLabel || "Período do cartão"}
            </Typography>
            <Typography fontSize={12.5} fontWeight={800}>
              Nível: {levelLabel(context.currentLevel)}
            </Typography>
            <Typography fontSize={12.5} fontWeight={800}>
              Dimensão: {dimensionLabel(context.demographicDimension || "none")}
            </Typography>
          </Box>
          {summary.length ? (
            <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { md: "repeat(4, minmax(0, 1fr))", sm: "repeat(2, minmax(0, 1fr))", xs: "1fr" } }}>
              {summary.map((item) => (
                <Box key={item.label} sx={{ bgcolor: "action.hover", borderRadius: 1.25, p: 1.25 }}>
                  <Typography color="text.secondary" fontSize={11.5} fontWeight={850}>
                    {item.label}
                  </Typography>
                  <Typography fontSize={18} fontWeight={900}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : null}
          <GeoDrillDownDemographicTabs onChange={onDemographicChange} tabs={demographicTabs} value={selectedTab} />
          <Box sx={{ maxHeight: 440, overflow: "auto", pr: 0.5 }}>
            {isPatientLevel && loading ? (
              <LinearProgress aria-label="A carregar pacientes" />
            ) : isPatientLevel && error ? (
              <Alert severity="warning">{error}</Alert>
            ) : isPatientLevel ? (
              <GeoDrillDownPatientsTable rows={patients} />
            ) : (
              <GeoDrillDownRanking emptyLabel={emptyLabel} error={error} loading={loading} onRowClick={onRowClick} rows={rows} />
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onBack} startIcon={reportActionIcons.resetFilters} variant="outlined">
          Voltar
        </Button>
        {showPatientsButton ? (
          <Button onClick={onOpenPatients} startIcon={reportActionIcons.drillDown} variant="contained">
            Ver pacientes
          </Button>
        ) : null}
        <Button onClick={onClose} startIcon={reportActionIcons.close} variant="outlined">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function levelLabel(level: GeoDrillDownLevel) {
  const labels: Record<GeoDrillDownLevel, string> = {
    district: "Distrito",
    facility: "Unidade Sanitária",
    patient: "Pacientes",
    province: "Província",
  };
  return labels[level];
}

function dimensionLabel(dimension: DemographicDimension) {
  const labels: Record<DemographicDimension, string> = {
    age: "Faixa etária",
    breastfeeding: "Lactação",
    gender: "Sexo",
    none: "Resumo",
    pregnancy: "Gravidez",
    result: "Resultado",
    testReason: "Motivo de teste",
  };
  return labels[dimension];
}
