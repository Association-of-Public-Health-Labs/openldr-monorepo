"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { DIALOG_BUTTON_OUTLINE, DIALOG_BUTTON_PRIMARY } from "../../../lib/dialog-styles";
import { DateRangeField } from "../../molecules/dates/DateRangeField";
import { initialRange, type IsoRange } from "../../molecules/dates/date-range";

export type DateRangeProps = {
  open: boolean;
  initialDates?: [string, string];
  handleSubmit?: (dates: [string, string]) => void;
  onClose?: () => void;
};

/** "Editar período": the card's date range. Same props and behaviour as the MUI dialog it replaces. */
export function DateRange({ open = false, initialDates, handleSubmit, onClose }: DateRangeProps) {
  const [dates, setDates] = useState<IsoRange>(() => initialRange(initialDates));

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose?.()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecione o intervalo</DialogTitle>
          <DialogDescription>Os dados do relatório são filtrados por este período.</DialogDescription>
        </DialogHeader>
        <DateRangeField value={dates} onChange={setDates} />
        <DialogFooter className="pt-2">
          <button type="button" className={DIALOG_BUTTON_OUTLINE} onClick={() => onClose?.()}>
            Cancelar
          </button>
          <button
            type="button"
            className={DIALOG_BUTTON_PRIMARY}
            onClick={() => {
              handleSubmit?.(dates);
              onClose?.();
            }}
          >
            Aplicar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
