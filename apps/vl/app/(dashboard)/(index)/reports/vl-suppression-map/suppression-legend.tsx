import { SUPPRESSION_BANDS } from "@/lib/vl/suppression";

export function SuppressionLegend() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[#637381] dark:text-[#919EAB]" aria-label="Legenda">
      {SUPPRESSION_BANDS.map((band) => (
        <li key={band.id} className="flex items-center gap-1.5">
          <span aria-hidden className="size-3 rounded-sm" style={{ backgroundColor: band.color }} />
          {band.label}
        </li>
      ))}
    </ul>
  );
}
