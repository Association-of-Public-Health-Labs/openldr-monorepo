"use client";

import { useEffect, useState } from "react";
import { parseAgeRange, type AgeRange } from "@/lib/vl/age";
import { Button } from "@repo/design_system/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@repo/design_system/components/ui/dialog";
import { Input } from "@repo/design_system/components/ui/input";
import { Label } from "@repo/design_system/components/ui/label";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Faixa etária</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="age-min">Início</Label>
            <Input id="age-min" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="age-max">Fim</Label>
            <Input id="age-max" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} />
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={apply}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
