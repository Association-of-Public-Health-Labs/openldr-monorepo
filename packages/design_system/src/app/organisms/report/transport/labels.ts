/** The page's own words, per app (VL and EID word their transport page alike, but each owns its text). */
export type TransportLabels = {
  PAGE_TITLE: string;
  /** What is measured ("Colheita à recepção no laboratório"), under the title and in the map subtitle. */
  LEG: string;
  MAP_TITLE: string;
  PROVINCE_HINT: string;
  DISTRICT_HINT: string;
  OTHER_DISTRICT_HINT: string;
  CLICK_HINT: string;
  SELECT_TITLE: string;
  SELECT_TEXT: string;
};

/** DOM ids of the cards (exports and the map image), per app. */
export type TransportIds = {
  map: string;
  /** The map alone, for the image export. */
  mapImage: string;
  detail: string;
};
