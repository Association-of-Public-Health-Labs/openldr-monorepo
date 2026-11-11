import { Activity, ArrowUpRight, Baby, FlaskConical, Microscope, type LucideIcon } from "lucide-react";
import type { CatalogEntry, CatalogId } from "../lib/catalog";

const ICONS: Record<CatalogId, LucideIcon> = {
  vl: Activity,
  tb: Microscope,
  eid: Baby,
  ad: FlaskConical,
};

/** One portal: a colour rule and icon chip in its primary colour, what it covers, and the way in. */
export function DashboardCard({ entry }: { entry: CatalogEntry }) {
  const Icon = ICONS[entry.id];
  const body = (
    <>
      <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: entry.color }} />
      <div className="flex items-start justify-between gap-4">
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${entry.color}1f`, color: entry.color }}
        >
          <Icon className="size-6" />
        </span>
        {entry.available ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#22c55e]/12 px-2.5 py-1 text-xs font-semibold text-[#118d57] dark:text-[#77ed8b]">
            <span aria-hidden className="size-1.5 rounded-full bg-current" />
            Disponível
          </span>
        ) : (
          <span className="rounded-full bg-[rgba(145,158,171,0.16)] px-2.5 py-1 text-xs font-semibold text-[#637381] dark:text-[#919EAB]">
            Em breve
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <p className="text-xs font-bold tracking-wide text-[#919EAB] uppercase">{entry.programme}</p>
        <h3 className="mt-1 text-lg font-bold text-[#1C252E] dark:text-white">{entry.name}</h3>
        <p className="text-sm text-[#637381] dark:text-[#919EAB]">{entry.portalTitle}</p>
        <p className="mt-3 text-sm leading-6 text-[#454F5B] dark:text-[#C4CDD5]">{entry.description}</p>

        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Testes">
          {entry.tests.map((t) => (
            <li
              key={t}
              className="rounded-md border border-dashed border-[rgba(145,158,171,0.32)] px-2 py-0.5 text-xs font-medium text-[#637381] dark:text-[#919EAB]"
            >
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          {entry.available ? (
            <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: entry.color }}>
              Abrir o portal
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          ) : (
            <span className="text-sm font-medium text-[#919EAB]">Em desenvolvimento</span>
          )}
        </div>
      </div>
    </>
  );

  const frame =
    "relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.12)] dark:bg-[#1d232a] dark:shadow-none dark:ring-1 dark:ring-[rgba(145,158,171,0.12)]";

  return entry.available ? (
    <a
      href={entry.href}
      className={`group ${frame} transition-shadow outline-none hover:shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_20px_40px_-4px_rgba(145,158,171,0.24)] focus-visible:ring-[3px] focus-visible:ring-ring/50`}
    >
      {body}
    </a>
  ) : (
    <div className={`${frame} opacity-80`} aria-disabled>
      {body}
    </div>
  );
}
