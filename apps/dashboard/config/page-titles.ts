export const DASHBOARD_APP_TITLE = "Portal de Testagem Laboratorial";

export type PageTitleMetadata = {
  subtitle: string;
  title: string;
};

export const pageTitles: Record<string, PageTitleMetadata> = {
  "/summary": {
    title: "Sumário Geral",
    subtitle: "Entrada unificada para Tuberculose, Carga Viral e DPI.",
  },
  "/tb": {
    title: "Tuberculose - Sumário",
    subtitle: "Base para os indicadores nacionais de Tuberculose.",
  },
  "/tb/lab": {
    title: "Tuberculose - Laboratório",
    subtitle: "Base para relatórios laboratoriais de Tuberculose.",
  },
  "/tb/clinic": {
    title: "Tuberculose - Província",
    subtitle: "Base para análises de Tuberculose por área geográfica e unidade sanitária.",
  },
  "/tb/patients": {
    title: "Tuberculose - Pacientes",
    subtitle: "Base para pesquisa e revisão de resultados de pacientes.",
  },
  "/viral-load": {
    title: "Carga Viral - Sumário",
    subtitle: "Base para os indicadores nacionais de Carga Viral.",
  },
  "/viral-load/lab": {
    title: "Carga Viral - Laboratório",
    subtitle: "Base para relatórios laboratoriais de Carga Viral.",
  },
  "/viral-load/clinic": {
    title: "Carga Viral - Província",
    subtitle: "Base para análises por área geográfica e unidade sanitária.",
  },
  "/viral-load/patients": {
    title: "Carga Viral - Pacientes",
    subtitle: "Base para pesquisa e revisão de resultados de pacientes.",
  },
  "/dpi": {
    title: "DPI - Sumário",
    subtitle: "Base para os indicadores nacionais de DPI/EID.",
  },
  "/dpi/lab": {
    title: "DPI - Laboratório",
    subtitle: "Base para relatórios laboratoriais de DPI/EID.",
  },
  "/dpi/clinic": {
    title: "DPI - Província",
    subtitle: "Base para análises de DPI por área geográfica e unidade sanitária.",
  },
  "/dpi/routes": {
    title: "DPI - Rotas de Amostras",
    subtitle: "Base para visualização de rotas de transporte de amostras.",
  },
};

export function getActivePage(pathname: string): PageTitleMetadata {
  return pageTitles[pathname] ?? {
    title: "Dashboard Unificada",
    subtitle: DASHBOARD_APP_TITLE,
  };
}

export function getDocumentTitle(pageTitle: string) {
  return `${DASHBOARD_APP_TITLE} | ${pageTitle}`;
}

