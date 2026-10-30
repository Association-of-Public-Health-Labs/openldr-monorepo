export const CARD_ID = "eid-tested-by-lab-poc";
export const TITLE = "Amostras Testadas por lab/PoC";
export const ENDPOINT = "/laboratories/tested_samples/";
/** The cache seed is {lab_type: poc, facility_type: province}; facility_type comes from the drill start (R18). */
export const EXTRA_PARAMS = { lab_type: "poc" };
export const DRILL_START = "province" as const;
