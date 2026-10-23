import { MousePointerClick } from "lucide-react";
import { cn } from "../../../lib/utils";

/**
 * Tells the user a map is clickable ("Clique numa província para ver os distritos"). It sits above
 * the map, never over it: on some provinces a hint inside the map's box covered districts.
 */
export function MapHint({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      data-slot="map-hint"
      className={cn("flex min-w-0 items-center gap-1.5 text-xs leading-[18px] text-[#637381] dark:text-[#919EAB]", className)}
    >
      <MousePointerClick aria-hidden className="size-4 shrink-0" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}
