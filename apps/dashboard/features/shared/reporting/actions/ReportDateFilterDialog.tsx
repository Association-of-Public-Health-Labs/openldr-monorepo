"use client";

import { useEffect, useState } from "react";
import { Alert, Box, DialogActions, DialogContent, DialogTitle, InputAdornment, Stack, Typography } from "@mui/material";
import { Button } from "@repo/design_system/app/atoms/inputs/Button";
import { Dialog } from "@repo/design_system/app/atoms/modals/Dialog";
import { TextField } from "@repo/design_system/app/atoms/inputs/TextField";
import { formatReportDateRangeLabel, formatReportIntervalDates, getDefaultReportDateRange } from "../dateRange";
import { reportActionIcons } from "./reportActionIcons";
import type { ReportActionDateRange } from "./types";

type ReportDateFilterDialogProps = {
  currentRange?: ReportActionDateRange;
  onApply: (range: ReportActionDateRange) => void;
  onClose: () => void;
  open: boolean;
};

export function ReportDateFilterDialog({ currentRange, onApply, onClose, open }: ReportDateFilterDialogProps) {
  const fallbackRange = getDefaultReportDateRange();
  const [startDate, setStartDate] = useState(currentRange?.startDateIso || fallbackRange.startDateIso);
  const [endDate, setEndDate] = useState(currentRange?.endDateIso || fallbackRange.endDateIso);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStartDate(currentRange?.startDateIso || fallbackRange.startDateIso);
    setEndDate(currentRange?.endDateIso || fallbackRange.endDateIso);
    setError(null);
  }, [currentRange?.endDateIso, currentRange?.startDateIso, fallbackRange.endDateIso, fallbackRange.startDateIso, open]);

  const buildRange = (nextStart: string, nextEnd: string): ReportActionDateRange => ({
    displayLabel: formatReportDateRangeLabel({ endDate: nextEnd, startDate: nextStart }),
    endDateIso: nextEnd,
    intervalDates: formatReportIntervalDates({ endDate: nextEnd, startDate: nextStart }),
    startDateIso: nextStart,
  });

  const handleApply = () => {
    if (!startDate || !endDate) {
      setError("Preencha a data inicial e a data final antes de aplicar.");
      return;
    }

    if (startDate > endDate) {
      setError("Período inválido: a data inicial não pode ser maior que a data final.");
      return;
    }

    onApply(buildRange(startDate, endDate));
    onClose();
  };

  const handleReset = () => {
    const defaultRange = getDefaultReportDateRange();
    setStartDate(defaultRange.startDateIso);
    setEndDate(defaultRange.endDateIso);
    setError(null);
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle>
        <Stack alignItems="center" direction="row" spacing={1}>
          {reportActionIcons.dateFilter}
          <Typography component="span" fontSize={20} fontWeight={850}>
            Filtrar período
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? <Alert severity="warning">{error}</Alert> : null}
          <TextField
            fullWidth
            helperText="Formato ISO: YYYY-MM-DD"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: <InputAdornment position="start">{reportActionIcons.dateFilter}</InputAdornment>,
            }}
            label="Data inicial"
            onChange={(event) => setStartDate(event.target.value)}
            type="date"
            value={startDate}
          />
          <TextField
            fullWidth
            helperText="Formato ISO: YYYY-MM-DD"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: <InputAdornment position="start">{reportActionIcons.dateFilter}</InputAdornment>,
            }}
            label="Data final"
            onChange={(event) => setEndDate(event.target.value)}
            type="date"
            value={endDate}
          />
          <Box>
            <Button onClick={handleReset} startIcon={reportActionIcons.resetFilters} variant="text">
              Repor período padrão
            </Button>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={reportActionIcons.close} variant="outlined">
          Cancelar
        </Button>
        <Button onClick={handleApply} startIcon={reportActionIcons.apply} variant="contained">
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
