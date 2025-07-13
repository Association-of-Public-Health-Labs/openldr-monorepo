import openrouter from "@/config/openrouter";
import { MODELS } from "@/config/constants";
import { generateObject } from "ai";
import { LanguageModelV1 } from "ai";
import { z } from "zod";
import { Stacked, schema as StackedSchema } from "@repo/design_system/atoms/charts/apex/Stacked";

export async function execute({
  query,
  chartType,
  chartId,
  data,
}: {
  query: string;
  chartType: string;
  chartId: string;
  data: any;
}) {
  
  const { object: timeInfo } = await generateObject({
    model: openrouter.chat(MODELS.EXTRACTION) as LanguageModelV1,
    schema: z.object({
      chartType: z.string().describe("Tipo de gráfico a ser gerado"),
      chartId: z.string().describe("ID do gráfico a ser gerado"),
    }),
    prompt: `
      Você é um assistente de IA que gera gráficos a partir de dados.
    `
  })
}