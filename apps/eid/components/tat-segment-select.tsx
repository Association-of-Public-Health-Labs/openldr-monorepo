"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/design_system/components/ui/select";
import { TAT_SEGMENTS } from "@/lib/eid/series";

type Props = { value: number; onChange: (category: number) => void };

/** Picks which of the 6 TAT segments a card breaks down (category 0-5). */
export function TatSegmentSelect({ value, onChange }: Props) {
  return (
    <div className="mx-4 flex items-center justify-end gap-2">
      <span className="text-sm text-muted-foreground">Segmento</span>
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="w-[320px] max-w-full" aria-label="Segmento do tempo de resposta">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TAT_SEGMENTS.map((segment, i) => (
            <SelectItem key={segment.key} value={String(i)}>
              {segment.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
