import { generateObject, LanguageModelV1 } from "ai";
import { TimeInterval } from "@/types";
import { z } from "zod";
import openrouter from "@/config/openrouter";
import { MODELS } from "@/config/constants";

async function execute({query}: {query: string}): Promise<TimeInterval> {
  const currentDate = new Date();
  const defaultStartDate = new Date(currentDate.setMonth(currentDate.getMonth() - 12));
  
  const { object: timeInfo } = await generateObject({
    model: openrouter.chat(MODELS.EXTRACTION) as LanguageModelV1,
    schema: z.object({
      hasTimeInterval: z.boolean().describe("Indica se a questão especifica um intervalo de tempo"),
      startDate: z.string().optional().describe("Data inicial no formato YYYY-MM-DD"),
      endDate: z.string().optional().describe("Data final no formato YYYY-MM-DD"),
    }),
    prompt: `
      Analise a questão e identifique o intervalo de tempo mencionado.
      Se não houver intervalo específico, retorne hasTimeInterval como false.
      Converta períodos textuais em datas específicas (ex: "primeiro trimestre de 2024" = "2024-01-01" a "2024-03-31")
      Use o formato de data YYYY-MM-DD.

      Exemplos de intervalos:
      - "janeiro a março de 2024"
      - "primeiro trimestre de 2024"
      - "2023"
      - "últimos 6 meses"
      - "desde janeiro"
      
      QUESTÃO: ${query}
    `
  });

  if (!timeInfo.hasTimeInterval) {
    return {
      startDate: defaultStartDate.toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      isDefault: true
    };
  }

  return {
    startDate: timeInfo.startDate || defaultStartDate.toISOString().split('T')[0],
    endDate: timeInfo.endDate || new Date().toISOString().split('T')[0],
    isDefault: false
  };
}

export default {
  execute
}