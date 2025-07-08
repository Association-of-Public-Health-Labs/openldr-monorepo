
import { LanguageModelV1, streamText } from "ai";
import { createDataStreamResponse } from "ai";
import prompts from "@/prompts/reporting";
import { DashboardType } from "@/types";
import openrouter from "@/config/openrouter";
import { MODELS } from "@/config/constants";

export async function execute({
  query,
  timeInterval,
  reportName,
  description,
  dashboard,
  resume,
  messages,
  dataStream,
}: {
  query: string;
  timeInterval: { startDate: string; endDate: string };
  reportName: string;
  description: string;
  dashboard: DashboardType;
  resume: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  // @ts-ignore
  dataStream: ReturnType<typeof createDataStreamResponse>['dataStream'];
}) {
  // Limit chat memory to last 6 exchanges to avoid token overflow
  const recentMessages = messages.slice(-6);  

  const systemMessage = {
    role: "system" as const,
    content: `
      ${prompts[dashboard]}

      RESUMO DO RELATÓRIO: ${resume}
      PERGUNTA DO UTILIZADOR: ${query}

      Tambem para auxiliar a responder, tens à tua disposição:
      - NOME DO RELATÓRIO: ${reportName}
      - DESCRIÇÃO DO RELATÓRIO: ${description}
      - PERÍODO DO RELATÓRIO: ${timeInterval.startDate} a ${timeInterval.endDate}
    `
  };

  const result = await streamText({
    model:  openrouter.chat(MODELS.ANALYSIS) as LanguageModelV1,
    messages: [systemMessage],
    // messages: [systemMessage, ...recentMessages],
  });

  result.mergeIntoDataStream(dataStream);
  // dataStream.close();
}

export default {
  execute
}