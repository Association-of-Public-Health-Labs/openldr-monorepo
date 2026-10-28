import { transportEndpoints } from "@repo/design_system/lib/report/transport/data";
import type { TransportIds, TransportLabels } from "@repo/design_system/app/organisms/report/transport/labels";
import type { ReportsLabels } from "@repo/design_system/app/organisms/report/transport/reports-drawer";
import { VL_BASE } from "@/lib/vl/api";

export const IDS: TransportIds = {
  map: "vl-transport-map",
  /** The map alone, for the image export. */
  mapImage: "vl-transport-map-image",
  detail: "vl-transport-detail",
};

/** `/hiv/vl/transport/tat_by_location/` and `/hiv/vl/transport/tat_by_week/`. */
export const ENDPOINTS = transportEndpoints(VL_BASE);

/** The weekly trend's line: VL's primary (#00B000, `--primary` under data-dashboard="vl"), as a hex value for Apex. */
export const TREND_COLOR = "#00B000";

export const LABELS = {
  PAGE_TITLE: "Monitoria de Transporte de Amostras",
  LEG: "Colheita à recepção no laboratório",
  MAP_TITLE: "Tempo de transporte das amostras",
  PROVINCE_HINT: "Clique numa província para ver os distritos",
  DISTRICT_HINT: "Clique num distrito para ver as unidades sanitárias",
  OTHER_DISTRICT_HINT: "Clique noutro distrito para o ver",
  CLICK_HINT: "Clique para ver os distritos",
  SELECT_TITLE: "Seleccione uma área",
  SELECT_TEXT: "Clique numa província para ver os distritos, e num distrito para ver as unidades sanitárias.",
} as const satisfies TransportLabels;

/** The weekly CV Excel reports drawer (files in Nextcloud). */
export const REPORTS = {
  BUTTON_OVERLINE: "Relatórios",
  BUTTON: "Semanais (Excel)",
  TITLE: "Relatórios semanais",
  SUBTITLE: "Relatórios de Carga Viral em Excel, gerados todas as semanas.",
  SEARCH: "Pesquisar semana ou mês",
  WEEK: "Semana",
  LATEST: "Mais recente",
  UPDATED: "actualizado a",
  DOWNLOAD: "Descarregar",
  NO_LINK: "Relatório não disponível",
  EMPTY: "Ainda não há relatórios semanais.",
  NO_MATCH: "Nenhum relatório corresponde à pesquisa.",
  ERROR: "Não foi possível obter os relatórios.",
  FILE: "ficheiro disponível",
  FILES: "ficheiros disponíveis",
} as const satisfies ReportsLabels;
