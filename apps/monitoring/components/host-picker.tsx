"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@repo/design_system/components/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@repo/design_system/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/design_system/components/ui/popover";
import type { Host } from "@/lib/monitoring/types";

/** Searchable list of sites (name or code); choosing one calls `onSelect` with its code. */
export function HostPicker({ hosts, value, onSelect }: { hosts: Host[]; value: string | null; onSelect: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = hosts.find((h) => h.code === value);
  const options = hosts.filter((h) => h.code).sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "pt"));
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full max-w-sm justify-between font-normal">
          <span className="truncate">{current?.name ?? "Escolher site"}</span>
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Procurar site por nome ou código" />
          <CommandList>
            <CommandEmpty>Nenhum site encontrado.</CommandEmpty>
            {options.map((h) => (
              <CommandItem
                key={h.id}
                value={`${h.name ?? ""} ${h.code}`}
                onSelect={() => {
                  setOpen(false);
                  onSelect(h.code as string);
                }}
              >
                <span className={`size-2 shrink-0 rounded-full ${h.status === "Online" ? "bg-success" : "bg-destructive"}`} aria-hidden />
                <span className="truncate">{h.name ?? "—"}</span>
                <span className="ml-auto text-xs text-muted-foreground">{h.code}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
