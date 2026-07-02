"use client";

import { Alert, Box, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { Button } from "@repo/design_system/app/atoms/inputs/Button";
import { Dialog } from "@repo/design_system/app/atoms/modals/Dialog";
import { ReportEmptyState, ReportLoadingState } from "../ReportStates";
import { reportActionIcons } from "./reportActionIcons";
import type { ReportDrillDownContext, ReportDrillDownRow } from "./types";

type ReportDrillDownDialogProps = {
  context?: ReportDrillDownContext;
  description?: string;
  error?: string | null;
  loading?: boolean;
  onClose: () => void;
  open: boolean;
  rows?: ReportDrillDownRow[];
  title: string;
};

export function ReportDrillDownDialog({ context, description, error, loading, onClose, open, rows = [], title }: ReportDrillDownDialogProps) {
  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle>
        <Stack alignItems="center" direction="row" spacing={1}>
          {reportActionIcons.drillDown}
          <Typography component="span" fontSize={20} fontWeight={850}>
            {title}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {description ? (
            <Typography color="text.secondary" fontSize={14}>
              {description}
            </Typography>
          ) : null}
          {context ? (
            <Box sx={{ bgcolor: "action.hover", borderRadius: 1, p: 1.4 }}>
              <Typography color="text.secondary" fontSize={12} fontWeight={800}>
                Contexto preparado
              </Typography>
              <Typography fontSize={13} sx={{ mt: 0.5 }}>
                {context.module} / {context.page} / {context.cardId}
              </Typography>
              {context.selectedLabel ? (
                <Typography fontSize={13} fontWeight={800} sx={{ mt: 0.5 }}>
                  {context.selectedDimension ? `${context.selectedDimension}: ` : null}
                  {context.selectedLabel}
                  {context.selectedValue !== undefined ? ` (${context.selectedValue})` : null}
                </Typography>
              ) : null}
            </Box>
          ) : null}
          {loading ? (
            <ReportLoadingState minHeight={220} />
          ) : error ? (
            <Alert severity="warning">{error}</Alert>
          ) : rows.length ? (
            <Stack spacing={1}>
              {rows.map((row) => (
                <Box key={row.id} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.3 }}>
                  <Typography fontSize={14} fontWeight={850}>
                    {row.label}
                  </Typography>
                  {row.value ? <Typography fontSize={13}>{row.value}</Typography> : null}
                  {row.description ? <Typography color="text.secondary" fontSize={12.5}>{row.description}</Typography> : null}
                </Box>
              ))}
            </Stack>
          ) : (
            <ReportEmptyState>O drill-down deste cartão está preparado para integração faseada.</ReportEmptyState>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={reportActionIcons.close} variant="outlined">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
