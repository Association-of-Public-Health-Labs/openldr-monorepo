import { ArrowUpRight, Cable, ShieldCheck, Wifi, type LucideIcon } from "lucide-react";
import type { ToolEntry, ToolId } from "../lib/catalog";

const ICONS: Record<ToolId, LucideIcon> = {
  monitoring: Wifi,
  epts: Cable,
  admin: ShieldCheck,
};

/** A complementary dashboard: a compact, single-row card, deliberately shorter than a portal card. */
export function ToolCard({ tool }: { tool: ToolEntry }) {
  const Icon = ICONS[tool.id];
  return (
    <a
      href={tool.href}
      className="group relative flex h-full items-start gap-4 overflow-hidden rounded-2xl bg-white p-5 shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.12)] transition-shadow outline-none hover:shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_20px_40px_-4px_rgba(145,158,171,0.24)] focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-[#1d232a] dark:shadow-none dark:ring-1 dark:ring-[rgba(145,158,171,0.12)]"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: tool.color }} />
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${tool.color}1f`, color: tool.color }}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="flex items-start justify-between gap-2 text-sm leading-5 font-bold text-[#1C252E] dark:text-white">
          {tool.name}
          <ArrowUpRight
            aria-hidden
            className="mt-0.5 size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            style={{ color: tool.color }}
          />
        </h3>
        <p className="mt-1 text-xs leading-5 text-[#637381] dark:text-[#919EAB]">{tool.description}</p>
      </div>
    </a>
  );
}
