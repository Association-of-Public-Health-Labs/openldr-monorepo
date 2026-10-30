import React from "react";

export type DocsLegendItem = {
  label: string;
  /** The series colour on the chart; a dot is drawn when given. */
  color?: string;
  description: string;
};

export type CardDocsProps = {
  /** One or two sentences: what the card shows and what it is for. */
  overview: React.ReactNode;
  /** The chart's series (or the map's colours), in the order the legend shows them. */
  legend?: DocsLegendItem[];
  /** How to read the chart: axes, what a bar/point/colour is, how values are computed. */
  reading?: string[];
  /** Tabs, clicks and drill-down, the menu's filters, exports. */
  options?: string[];
  /** Where the data comes from: the API path, e.g. "/tb/gx/laboratories/registered_samples_by_lab/". */
  endpoint?: string;
  /** Anything else worth knowing: exclusions, defaults, known limits. */
  notes?: string[];
};

// Minimals typography (measured on minimals.cc, 2026-10-19): 12px bold uppercase grey section titles,
// 14px body, primary text #1C252E and secondary #637381.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h4 className="text-xs font-bold tracking-wide text-[#919EAB] uppercase">{title}</h4>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span aria-hidden className="mt-[9px] size-1 shrink-0 rounded-full bg-[#919EAB]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** A report card's documentation, the same layout for every card and dashboard. */
export function CardDocs({ overview, legend = [], reading = [], options = [], endpoint, notes = [] }: CardDocsProps) {
  return (
    <div data-slot="card-docs" className="space-y-6 text-sm leading-[22px] text-[#637381] dark:text-[#919EAB]">
      <Section title="Visão geral">
        <p className="text-[#1C252E] dark:text-white">{overview}</p>
      </Section>

      {legend.length > 0 && (
        <Section title="Séries do gráfico">
          <ul className="space-y-2.5">
            {legend.map((item) => (
              <li key={item.label} className="flex gap-2.5">
                <span
                  aria-hidden
                  className="mt-[5px] size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color ?? "#C4CDD5" }}
                />
                <span>
                  <span className="font-semibold text-[#1C252E] dark:text-white">{item.label}</span>
                  {item.description ? ` — ${item.description}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {reading.length > 0 && (
        <Section title="Como ler">
          <Bullets items={reading} />
        </Section>
      )}

      {options.length > 0 && (
        <Section title="Filtros e opções">
          <Bullets items={options} />
        </Section>
      )}

      {(endpoint || notes.length > 0) && (
        <Section title="Notas técnicas">
          <div className="space-y-2">
            {endpoint && (
              <p>
                Fonte dos dados:{" "}
                <code className="rounded-md bg-[rgba(145,158,171,0.12)] px-1.5 py-0.5 font-mono text-[12.5px] break-all text-[#1C252E] dark:text-white">
                  GET {endpoint}
                </code>
              </p>
            )}
            {notes.length > 0 && <Bullets items={notes} />}
          </div>
        </Section>
      )}
    </div>
  );
}
