import type { DashboardId, DashboardInfo } from "@repo/design_system/dashboards";

export type CatalogId = DashboardId | "ad";

export interface CatalogEntry {
  id: CatalogId;
  name: string;
  portalTitle: string;
  programme: string;
  description: string;
  tests: string[];
  color: string;
  available: boolean;
  /** Only for an available dashboard. */
  href?: string;
}

/** What the home page says about each dashboard; name, link, colour and status come from the registry. */
const COPY: Record<DashboardId, Pick<CatalogEntry, "programme" | "description" | "tests">> = {
  vl: {
    programme: "HIV",
    description: "Supressão viral, amostras registadas e testadas, rejeições e tempo de resposta da carga viral, por laboratório e unidade sanitária.",
    tests: ["Carga viral"],
  },
  tb: {
    programme: "Tuberculose",
    description: "Resultados do GeneXpert: amostras registadas, positividade, resistência à rifampicina e tempo de resposta, do laboratório ao paciente.",
    tests: ["Xpert MTB/RIF Ultra", "Xpert MTB/XDR"],
  },
  eid: {
    programme: "HIV",
    description: "Diagnóstico precoce infantil do HIV: amostras de PCR, positividade, transporte de amostras e resultados por unidade sanitária.",
    tests: ["PCR de DPI"],
  },
};

/** Planned dashboards, not yet in the registry. */
const PLANNED: CatalogEntry[] = [
  {
    id: "ad",
    name: "Doenças Avançadas",
    portalTitle: "Portal de Doença Avançada por HIV",
    programme: "HIV",
    description: "CD4, CrAg e TB-LAM para o seguimento da doença avançada por HIV, num só painel.",
    tests: ["CD4", "CrAg", "TB-LAM"],
    color: "#7A4DFF",
    available: false,
  },
];

export function buildCatalog(dashboards: DashboardInfo[]): CatalogEntry[] {
  const live = dashboards.map<CatalogEntry>((d) => ({
    id: d.id,
    name: d.name,
    portalTitle: d.portalTitle,
    ...COPY[d.id],
    color: d.primary,
    available: d.ready,
    href: d.ready ? d.url : undefined,
  }));
  return [...live, ...PLANNED];
}
