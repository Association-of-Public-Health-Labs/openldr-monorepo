"use client";

import { Tabs } from "../../../components/ui/tabs";
import { SegmentedTabsList, SegmentedTabsTrigger } from "../../../components/ui/segmented-tabs";

export type SegmentedSwitchProps<V extends string> = {
  items: { value: V; label: string }[];
  value: V;
  onChange: (value: V) => void;
  /** Classes of the switch track (e.g. "mx-4 ml-auto" to sit at the right of a card, as in TB). */
  className?: string;
  /** Classes of the Tabs root ("w-full" inside a card body, so the track can align right). */
  rootClassName?: string;
};

/**
 * TB's segmented switch (Ultra / XDR): a grey track with the active option on a white pill.
 * Controlled, so a card can reset it on "Reiniciar o relatório".
 */
export function SegmentedSwitch<V extends string>({ items, value, onChange, className, rootClassName }: SegmentedSwitchProps<V>) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as V)} className={rootClassName}>
      <SegmentedTabsList className={className}>
        {items.map((item) => (
          <SegmentedTabsTrigger key={item.value} value={item.value}>
            {item.label}
          </SegmentedTabsTrigger>
        ))}
      </SegmentedTabsList>
    </Tabs>
  );
}
