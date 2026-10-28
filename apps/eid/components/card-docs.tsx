import { CardDocs as SharedCardDocs, type DocsLegendItem } from "@repo/design_system/app/molecules/docs/CardDocs";

export type CardDocsProps = {
  overview: string;
  /** The chart's series, with their colours. */
  legend?: DocsLegendItem[];
  reading: string[];
  filters: string[];
  /** Path under /hiv/eid, e.g. "/summary/indicators/". */
  endpoint: string;
  notes?: string[];
};

/** EID card documentation: the shared layout, with the endpoint under /hiv/eid. */
export function CardDocs({ overview, legend, reading, filters, endpoint, notes }: CardDocsProps) {
  return (
    <SharedCardDocs overview={overview} legend={legend} reading={reading} options={filters} endpoint={`/hiv/eid${endpoint}`} notes={notes} />
  );
}
