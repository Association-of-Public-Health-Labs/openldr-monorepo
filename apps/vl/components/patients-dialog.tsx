"use client";

import { useState } from "react";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { formatNumber } from "@repo/design_system/lib/format-number";
import { exportSheet } from "@repo/design_system/lib/report/export/excel";
import { PATIENT_HEADERS, patientToRow } from "@/lib/vl/patients";
import type { PatientsDialogState } from "@/hooks/use-facility-report";
import { CardMessage } from "@repo/design_system/app/organisms/report/card-message";
import { PatientsTable, PatientsTableSkeleton } from "./patients-table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/design_system/components/ui/dialog";
import { DIALOG_BUTTON_OUTLINE, DIALOG_BUTTON_PRIMARY } from "@repo/design_system/lib/dialog-styles";

export function PatientsDialog({
  state,
  subtitle,
  onClose,
}: {
  state: PatientsDialogState;
  subtitle: string;
  onClose: () => void;
}) {
  const [exportError, setExportError] = useState<string | null>(null);
  const title = `Pacientes — ${state.title}`;
  const ready = !state.loading && !state.error && state.rows.length > 0;
  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] gap-5 sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="pr-10">{title}</DialogTitle>
          <DialogDescription>
            {subtitle}
            {ready && (
              <span className="ml-2 inline-flex h-6 items-center rounded-md bg-[rgba(145,158,171,0.16)] px-1.5 text-xs font-bold text-[#637381] tabular-nums dark:text-[#919EAB]">
                {formatNumber(state.total)} pacientes
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {state.loading ? (
          <PatientsTableSkeleton />
        ) : state.error ? (
          <CardMessage tone="error" message={state.error} />
        ) : state.rows.length === 0 ? (
          <CardMessage tone="empty" message="Nenhum paciente encontrado." />
        ) : (
          <>
            {state.total > state.rows.length && (
              <p className="rounded-lg bg-[rgba(0,184,217,0.08)] px-3 py-2 text-sm text-[#006C9C] dark:text-[#61F3F3]">
                A mostrar {formatNumber(state.rows.length)} de {formatNumber(state.total)}. Use a página Pacientes para a lista completa.
              </p>
            )}
            <PatientsTable rows={state.rows} />
          </>
        )}
        {exportError && <p role="alert" className="text-sm text-[#B71D18] dark:text-[#FFAC82]">{exportError}</p>}

        <DialogFooter>
          <button
            type="button"
            className={`${DIALOG_BUTTON_OUTLINE} inline-flex items-center gap-2`}
            disabled={state.rows.length === 0}
            onClick={() => {
              try {
                setExportError(null);
                exportSheet(title, subtitle, { header: PATIENT_HEADERS, rows: state.rows.map(patientToRow) });
              } catch {
                setExportError("Não foi possível exportar para Excel.");
              }
            }}
          >
            <PiMicrosoftExcelLogoFill aria-hidden className="size-5 text-[#22C55E]" />
            Exportar para Excel
          </button>
          <button type="button" className={DIALOG_BUTTON_PRIMARY} onClick={onClose}>Fechar</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
