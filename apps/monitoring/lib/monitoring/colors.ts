import type { HostType } from "./types";

/** The only hex colours in the app: category series, status and "no data" on the maps. */
export const CATEGORY_COLORS: Record<HostType | "all", string> = {
  // Neither the status colours (online green, offline red) nor the Monitoria indigo.
  all: "#00B8D9", Disalab: "#8E33FF", Disapoc: "#F8A200", Disalink: "#D63384",
};

export const CATEGORY_LABELS: Record<HostType | "all", string> = {
  all: "Todos os sites", Disalab: "Disalab", Disapoc: "DisaPoC", Disalink: "DisaLink",
};

/** Same values as the theme's --success and --destructive (charts need literal colours). */
export const ONLINE_COLOR = "#00B000";
export const OFFLINE_COLOR = "#EF5350";

/** Map areas without data, as EID's maps. */
export const NO_DATA_COLOR = "#C4CDD5";

/** Monitoria's primary (registry), for map shading. */
export const MONITORING_PRIMARY = "#5B6CFF";
