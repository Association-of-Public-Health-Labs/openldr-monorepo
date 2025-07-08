
import { streamText, createDataStreamResponse, LanguageModelV1 } from "ai";
import { openai } from "@/config/openai";
import { prompts } from "@/prompts/generic";
import { DashboardType } from "@/types";
import openrouter from "@/config/openrouter";
import { MODELS } from "@/config/constants";

async function execute({
  reportName,
  description,
  messages,
  resume,
  dashboard,
}: {
  query: string;
  reportName: string;
  description: string;
  dashboard: DashboardType;
  resume?: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}) {
  const recentMessages = messages.slice(-6);

  const systemMessage = {
    role: 'system' as const,
    content: `
      ${prompts[dashboard]}

      CONTEXTO disponível:
      - NOME DO RELATÓRIO: ${reportName}
      - DESCRIÇÃO DETALHADA: ${description}
      ${resume ? `- RESUMO DOS RESULTADOS: ${resume}` : ''}
    `
  };

  return createDataStreamResponse({
    execute: async (dataStream) => {
      dataStream.writeData(
        JSON.stringify({
          agent: 'agent-generic',
          reportName,
          description,
          resume,
          type: 'metadata',
        }) + '\n'
      );

      const result = await streamText({
        model: openrouter.chat(MODELS.PLANNING) as LanguageModelV1,
        messages: [systemMessage, ...recentMessages],
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}

export default {
  execute
}