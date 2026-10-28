"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { DIALOG_BUTTON_OUTLINE, DIALOG_BUTTON_PRIMARY } from "../../../lib/dialog-styles";
import { cn } from "../../../lib/utils";

export function LabGroupsDialog({
  open,
  onOpenChange,
  selected,
  onApply,
  groups,
  notice,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: string[];
  onApply: (names: string[]) => void;
  groups: { name: string; codes: string[] }[];
  /** Shown above the list (e.g. the list could not be loaded). */
  notice?: string;
}) {
  const [checked, setChecked] = useState<string[]>(selected);
  useEffect(() => {
    if (open) setChecked(selected);
  }, [open, selected]);

  const toggle = (name: string) =>
    setChecked((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Seleccionar laboratórios</DialogTitle>
          <DialogDescription>Sem selecção, cada relatório usa o seu filtro por omissão (ver a documentação do cartão).</DialogDescription>
        </DialogHeader>

        {notice && (
          <p role="alert" className="text-sm text-[#637381] dark:text-[#919EAB]">
            {notice}
          </p>
        )}

        {/* One tile per lab: name and its LIMS codes, ticked when chosen. */}
        <div role="group" aria-label="Laboratórios" className="grid max-h-[55vh] grid-cols-1 gap-2 overflow-y-auto p-0.5 sm:grid-cols-2">
          {groups.map((group) => {
            const on = checked.includes(group.name);
            return (
              <button
                key={group.name}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(group.name)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40",
                  on
                    ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]"
                    : "border-[rgba(145,158,171,0.2)] hover:bg-[rgba(145,158,171,0.08)]",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors",
                    on ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[#919EAB]",
                  )}
                >
                  {on && <Check className="size-3" strokeWidth={3.5} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[#1C252E] dark:text-white">{group.name}</span>
                  <span className="block truncate text-xs text-[#919EAB]">{group.codes.join(" · ")}</span>
                </span>
              </button>
            );
          })}
        </div>

        <DialogFooter className="items-center pt-2 sm:justify-between">
          <p className="text-sm text-[#637381] dark:text-[#919EAB]">
            {checked.length === 0 ? "Nenhum seleccionado" : `${checked.length} seleccionado${checked.length > 1 ? "s" : ""}`}
            {checked.length > 0 && (
              <button
                type="button"
                onClick={() => setChecked([])}
                className="ml-3 font-semibold text-[#1C252E] underline-offset-4 hover:underline dark:text-white"
              >
                Limpar
              </button>
            )}
          </p>
          <div className="flex gap-2">
            <button type="button" className={DIALOG_BUTTON_OUTLINE} onClick={() => onOpenChange(false)}>Cancelar</button>
            <button type="button" className={DIALOG_BUTTON_PRIMARY} onClick={() => onApply(checked)}>Aplicar</button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
