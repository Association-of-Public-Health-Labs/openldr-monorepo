import { transportEndpoints } from "@repo/design_system/lib/report/transport/data";
import type { Params } from "@repo/design_system/lib/report/params";
import type { TransportIds, TransportLabels } from "@repo/design_system/app/organisms/report/transport/labels";
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

export type TypeTab = "all" | "conventional" | "poc";

export const TYPE_TABS: { value: TypeTab; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "conventional", label: "Convencional" },
  { value: "poc", label: "PoC" },
];

/** The API's `type_of_test` values; "all" sends none. */
const TYPE_OF_TEST: Record<Exclude<TypeTab, "all">, string> = { conventional: "Convencional", poc: "Point-of-care" };

/** The extra request params of a tab (none for all). */
export const typeParams = (tab: TypeTab): Params | undefined =>
  tab === "all" ? undefined : { type_of_test: TYPE_OF_TEST[tab] };
