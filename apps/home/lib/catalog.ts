import type { DashboardId, DashboardInfo } from "@repo/design_system/dashboards";

/** Main portals: every registry entry except the monitoring and admin apps, which are listed as tools. */
export type PortalId = Exclude<DashboardId, ToolRegistryId>;

/** Registry dashboards the home page lists as complementary tools, below the portals. */
type ToolRegistryId = Extract<DashboardId, "monitoring" | "admin">;

export type ToolId = ToolRegistryId | "epts";

export type CatalogId = PortalId | "ad";

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
const COPY: Record<PortalId, Pick<CatalogEntry, "programme" | "description" | "tests">> = {
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
    description: "CD4, CrAg e TB-LAM para o seguimento da doença avançada por HIV, num só portal.",
    tests: ["CD4", "CrAg", "TB-LAM"],
    color: "#7A4DFF",
    available: false,
  },
];

export function buildCatalog(dashboards: DashboardInfo[]): CatalogEntry[] {
  const live = dashboards
    .filter((d): d is DashboardInfo & { id: PortalId } => !isToolId(d.id))
    .map<CatalogEntry>((d) => ({
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

export interface ToolEntry {
  id: ToolId;
  name: string;
  description: string;
  color: string;
  href: string;
}

const TOOL_IDS: readonly ToolRegistryId[] = ["monitoring", "admin"];

function isToolId(id: DashboardId): id is ToolRegistryId {
  return (TOOL_IDS as readonly DashboardId[]).includes(id);
}

const EPTS_URL = "https://dashboards.openldr.org.mz";

/** What the home page says about each tool; link and colour of the registry ones come from the registry. */
const TOOL_COPY: Record<ToolId, Pick<ToolEntry, "name" | "description">> = {
  monitoring: {
    name: "Monitoria da Conectividade",
    description: "Laboratórios, pontos de PoC e DisaLink online e offline, e o tempo fora de linha de cada site.",
  },
  epts: {
    name: "Monitoria da Interoperabilidade com EPTS",
    description: "Troca de resultados entre o OpenLDR e o EPTS, o Sistema Electrónico de Seguimento de Pacientes.",
  },
  admin: {
    name: "Administração",
    description: "Utilizadores, perfis e acessos aos portais OpenLDR.",
  },
};

/**
 * Complementary dashboards, in display order. They are always linked: each has its own sign-in,
 * and the registry's `ready` flag only governs the in-portal switcher.
 */
export function buildTools(dashboards: DashboardInfo[]): ToolEntry[] {
  const fromRegistry = (id: ToolRegistryId): ToolEntry => {
    const d = dashboards.find((x) => x.id === id);
    if (!d) throw new Error(`Dashboard ${id} missing from the registry`);
    return { id, ...TOOL_COPY[id], color: d.primary, href: d.url };
  };
  return [
    fromRegistry("monitoring"),
    { id: "epts", ...TOOL_COPY.epts, color: "#E0479E", href: EPTS_URL },
    fromRegistry("admin"),
  ];
}
