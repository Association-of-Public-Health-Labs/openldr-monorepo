import { CardDocs as SharedCardDocs, type DocsLegendItem } from "@repo/design_system/app/molecules/docs/CardDocs";

export type CardDocsProps = {
  overview: string;
  /** The chart's series, with their colours. */
  legend?: DocsLegendItem[];
  reading: string[];
  filters: string[];
  /** Path under /hiv/vl, e.g. "/summary/viral_suppression_by_month/". */
  endpoint: string;
  notes?: string[];
};

/** VL card documentation: the shared layout, with the endpoint under /hiv/vl. */
export function CardDocs({ overview, legend, reading, filters, endpoint, notes }: CardDocsProps) {
  return (
    <SharedCardDocs
      overview={overview}
      legend={legend}
      reading={reading}
      options={filters}
      endpoint={`/hiv/vl${endpoint}`}
      notes={notes}
    />
  );
}
