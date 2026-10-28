export const MAP_CARD_ID = "vl-transport-map";
/** The map alone, for the image export. */
export const MAP_IMAGE_ID = "vl-transport-map-image";
export const DETAIL_CARD_ID = "vl-transport-detail";

/** Weeks in the picker and the weekly chart. */
export const WEEK_COUNT = 28;

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
} as const;

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
} as const;
