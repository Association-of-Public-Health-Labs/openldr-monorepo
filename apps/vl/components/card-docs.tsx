export type CardDocsProps = {
  overview: string;
  reading: string[];
  filters: string[];
  endpoint: string;
  notes?: string[];
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1 font-semibold">{title}</h3>
      {children}
    </section>
  );
}

export function CardDocs({ overview, reading, filters, endpoint, notes = [] }: CardDocsProps) {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <Section title="Visão Geral">
        <p>{overview}</p>
      </Section>
      <Section title="Como ler o gráfico">
        <ul className="list-disc space-y-1 pl-5">{reading.map((r) => <li key={r}>{r}</li>)}</ul>
      </Section>
      <Section title="Filtros">
        <ul className="list-disc space-y-1 pl-5">{filters.map((f) => <li key={f}>{f}</li>)}</ul>
      </Section>
      <Section title="Notas técnicas">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Fonte: <code>GET /hiv/vl{endpoint}</code>
          </li>
          {notes.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </Section>
    </div>
  );
}
