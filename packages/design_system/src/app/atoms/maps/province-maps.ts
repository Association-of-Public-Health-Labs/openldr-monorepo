import type { ComponentType } from "react";
import {
  CaboDelgado, Gaza, Inhambane, Manica, MaputoCidade, MaputoProvincia, Nampula, Niassa, Sofala, Tete, Zambezia,
} from "./Provinces";

/** Each province's district map, by the name the national map's click gives (see lib/report/districts). */
// The shared province maps each have their own props type.
export const PROVINCE_MAPS: Record<string, ComponentType<any>> = {
  Niassa, "Cabo Delgado": CaboDelgado, Nampula, Zambezia, Tete, Manica, Sofala, Inhambane, Gaza,
  "Maputo Provincia": MaputoProvincia, "Maputo Cidade": MaputoCidade,
};
