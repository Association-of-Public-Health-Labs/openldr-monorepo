
import { tool } from "ai";
import { z } from "zod";

import { FacilityType } from "@/types";

const fetchHealthcareInfo = tool({
  description: "Faz uma chamada ao endpoint do dicionario do OpenLDR",
  parameters: z.object({
    apiEndpoint: z.string().describe("O endpoint do dicionario do OpenLDR"),
  }),
  // location below is inferred to be a string:
  execute: async ({ apiEndpoint }) => {
    const response = await fetch(process.env.OPENLDR_API + apiEndpoint)
    const data = await response.json()
    return data 
  },
});

export function getDictionaryEndpoint (facilityType: FacilityType) {
  switch (facilityType) {
    case "province":
      return "/dict/provinces";
    case "district":
      return "/dict/districts";
    case "clinic":
      return "/dict/clinics";
    case "lab":
      return "/dict/labs";
    case "national":
      return null;
    default:
      return null;
  }
}

export default {
  getDictionaryEndpoint,
  fetchHealthcareInfo
}