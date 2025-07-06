import { openai } from "@/config/openai";
import { streamText } from "ai";
import { createDataStreamResponse } from "ai";
import prompts from "@/prompts/analytics";
import { DashboardType } from "@/types";

export async function execute({
  timeInterval,
  reportName,
  description,
  dashboard,
  resume,
  messages,
  dataStream,
}: {
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

      Tens à tua disposição:
      - NOME DO RELATÓRIO: ${reportName}
      - DESCRIÇÃO DO RELATÓRIO: ${description}
      - RESUMO DOS RESULTADOS: ${resume}
      - PERÍODO DO RELATÓRIO: ${timeInterval.startDate} a ${timeInterval.endDate}
    `
  };

  const result = await streamText({
    model: openai,
    messages: [systemMessage, ...recentMessages],
  });

  result.mergeIntoDataStream(dataStream);
  // dataStream.close();
}

export default {
  execute
}