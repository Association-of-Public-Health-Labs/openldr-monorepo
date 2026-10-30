"use client";

import { useEffect, useState } from "react";
import { parseAgeRange, type AgeRange } from "@/lib/vl/age";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/design_system/components/ui/dialog";
import { Input } from "@repo/design_system/components/ui/input";
import { Label } from "@repo/design_system/components/ui/label";
import { DIALOG_BUTTON_OUTLINE, DIALOG_BUTTON_PRIMARY, DIALOG_LABEL } from "@repo/design_system/lib/dialog-styles";
import { cn } from "@repo/design_system/lib/utils";

// Common ranges in HIV reporting, one click away; any other range is typed below.
const PRESETS: { label: string; range: AgeRange }[] = [
  { label: "0–14", range: [0, 14] },
  { label: "15–24", range: [15, 24] },
  { label: "15–49", range: [15, 49] },
  { label: "25–49", range: [25, 49] },
  { label: "50+", range: [50, 120] },
];

export function AgeRangeDialog({
  open,
  onOpenChange,
  value,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: AgeRange;
  onApply: (range: AgeRange) => void;
}) {
  const [min, setMin] = useState(String(value[0]));
  const [max, setMax] = useState(String(value[1]));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMin(String(value[0]));
      setMax(String(value[1]));
      setError(null);
    }
  }, [open, value]);

  const apply = () => {
    const parsed = parseAgeRange(min, max);
    if (typeof parsed === "string") {
      setError(parsed);
      return;
    }
    onApply(parsed);
  };

  const pick = ([lo, hi]: AgeRange) => {
    setMin(String(lo));
    setMax(String(hi));
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Faixa etária</DialogTitle>
          <DialogDescription>Idades em anos, de 0 a 120.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <p className={DIALOG_LABEL}>Faixas frequentes</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => {
              const active = min === String(preset.range[0]) && max === String(preset.range[1]);
              return (
                <button
                  key={preset.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => pick(preset.range)}
                  className={cn(
                    "h-8 rounded-lg border px-3 text-[13px] font-semibold tabular-nums transition-colors",
                    active
                      ? "border-[#1C252E] bg-[#1C252E] text-white dark:border-white dark:bg-white dark:text-[#1C252E]"
                      : "border-[rgba(145,158,171,0.32)] text-[#1C252E] hover:bg-[rgba(145,158,171,0.08)] dark:text-white",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { id: "age-min", label: "De", value: min, set: setMin },
            { id: "age-max", label: "Até", value: max, set: setMax },
          ].map((field) => (
            <div key={field.id} className="flex flex-col gap-2">
              <Label htmlFor={field.id} className={DIALOG_LABEL}>{field.label}</Label>
              <div className="relative">
                <Input
                  id={field.id}
                  inputMode="numeric"
                  value={field.value}
                  aria-invalid={error ? true : undefined}
                  onChange={(e) => {
                    field.set(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && apply()}
                  className="h-10 pr-14 tabular-nums"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-[#919EAB]">anos</span>
              </div>
            </div>
          ))}
        </div>
        {error && <p role="alert" className="text-sm text-[#B71D18] dark:text-[#FFAC82]">{error}</p>}

        <DialogFooter className="pt-2">
          <button type="button" className={DIALOG_BUTTON_OUTLINE} onClick={() => onOpenChange(false)}>Cancelar</button>
          <button type="button" className={DIALOG_BUTTON_PRIMARY} onClick={apply}>Aplicar</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
