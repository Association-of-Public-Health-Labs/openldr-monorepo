import { transportEndpoints } from "@repo/design_system/lib/report/transport/data";
import type { Params } from "@repo/design_system/lib/report/params";
import type { TransportIds, TransportLabels } from "@repo/design_system/app/organisms/report/transport/labels";
import type { ReportsLabels } from "@repo/design_system/app/organisms/report/transport/reports-drawer";
import { EID_BASE } from "@/lib/eid/api";

export const IDS: TransportIds = {
  map: "eid-transport-map",
  /** The map alone, for the image export. */
  mapImage: "eid-transport-map-image",
  detail: "eid-transport-detail",
};

/** `/hiv/eid/transport/tat_by_location/` and `/hiv/eid/transport/tat_by_week/`. */
export const ENDPOINTS = transportEndpoints(EID_BASE);

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

/**
 * Conventional laboratories only (user decision, 2026-10-28): every transport request sends the API value
 * `type_of_test=Convencional`. Module level, so the params are one stable object across renders.
 */
export const EXTRA_PARAMS: Params = { type_of_test: "Convencional" };

/** The app's route handler for the weekly DPI reports (`/reports/DPI/<ano>/<Mês>/<semana>/`). */
export const REPORTS_ENDPOINT = "/api/reports/dpi";

/** The weekly DPI Excel reports drawer. The text never names where the files are kept. */
export const REPORTS = {
  BUTTON_OVERLINE: "Relatórios",
  BUTTON: "Semanais (Excel)",
  TITLE: "Relatórios semanais",
  SUBTITLE: "Relatórios de tempo de resposta do diagnóstico precoce infantil em Excel, gerados todas as semanas.",
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
