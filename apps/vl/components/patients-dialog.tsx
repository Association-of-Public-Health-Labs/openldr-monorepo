"use client";

import { useState } from "react";
import { SyncLoader } from "react-spinners";
import { exportSheet } from "@/lib/vl/export/excel";
import { PATIENT_HEADERS, patientToRow } from "@/lib/vl/patients";
import type { PatientsDialogState } from "@/hooks/use-facility-report";
import { CardMessage } from "./card-message";
import { PatientsTable } from "./patients-table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

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
  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>
        {state.loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <SyncLoader size={8} />
          </div>
        ) : state.error ? (
          <CardMessage tone="error" message={state.error} />
        ) : state.rows.length === 0 ? (
          <CardMessage tone="empty" message="Nenhum paciente encontrado." />
        ) : (
          <>
            {state.total > state.rows.length && (
              <p className="text-sm text-muted-foreground">
                A mostrar {state.rows.length} de {state.total}. Use a página Pacientes para a lista completa.
              </p>
            )}
            <PatientsTable rows={state.rows} />
          </>
        )}
        {exportError && <p className="text-sm text-red-500">{exportError}</p>}
        <DialogFooter>
          <Button
            variant="outline"
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
            Exportar para Excel
          </Button>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
