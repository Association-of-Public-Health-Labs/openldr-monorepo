export const CARD_ID = "eid-tested-by-lab-conventional";
export const TITLE = "Amostras Testadas por lab/Convencional";
export const ENDPOINT = "/laboratories/tested_samples/";
/** The cache seed {lab_type: conventional}. The drill owns facility_type, lab_code and the rest. */
export const EXTRA_PARAMS = { lab_type: "conventional" };
export const DRILL_START = "lab" as const;
