export type LegendTotalItem = { name: string; color: string; value: string };

/**
 * Legend above a chart with each series' total, as Minimals' "Area installed" (measured on
 * minimals.cc, 2026-10-19): 12px dot, 13px/500 name, 18px/600 value 8px below, 24px apart.
 * Aligned with the card title (card body 16px + 8px).
 */
export function LegendTotals({ items }: { items: LegendTotalItem[] }) {
  return (
    <ul aria-label="Legenda" className="flex flex-wrap gap-x-6 gap-y-3 px-2 pb-2">
      {items.map((item) => (
        <li key={item.name} className="flex flex-col">
          <span className="flex items-center gap-1.5 text-[13px] leading-[19.5px] font-medium text-[#1C252E] dark:text-white">
            <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </span>
          <span className="mt-2 text-lg leading-7 font-semibold text-[#1C252E] dark:text-white">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
