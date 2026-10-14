"use client";

import { useEffect, useState } from "react";
import { LAB_GROUPS } from "@/lib/vl/labs";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

export function LabGroupsDialog({
  open,
  onOpenChange,
  selected,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: string[];
  onApply: (names: string[]) => void;
}) {
  const [checked, setChecked] = useState<string[]>(selected);
  useEffect(() => {
    if (open) setChecked(selected);
  }, [open, selected]);

  const toggle = (name: string) =>
    setChecked((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Seleccionar laboratórios</DialogTitle>
          <DialogDescription>Sem selecção, cada relatório usa o seu filtro por omissão (ver a documentação do cartão).</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {LAB_GROUPS.map((group) => (
            <label key={group.name} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={checked.includes(group.name)} onChange={() => toggle(group.name)} />
              <span>{group.name}</span>
              <span className="text-xs text-muted-foreground">{group.codes.join(", ")}</span>
            </label>
          ))}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setChecked([])}>Limpar</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => onApply(checked)}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
