import { z } from "zod";
import { generateObject } from "ai";
import { prompts } from "@/prompts/supervisor";
import { openai } from "@/config/openai";
import { DashboardType } from "@/types";

export interface SuperviseProps {
  query: string;
  endpoint: string;
  facilityType: string;
  messages: any;
  dashboard: DashboardType;
}

async function execute({query, endpoint, facilityType, messages, dashboard}: SuperviseProps) {
  const prompt = prompts[dashboard];
  //classify the query to decide what to do
  const { object: classification } = await generateObject({
    model: openai,
    schema: z.object({
      agent: z.enum([
        "agent-get-data-from-api", 
        "agent-analyze-data", 
        "agent-generate-excel-report", 
        "agent-generic"
      ]).describe("The agent to be used to answer the query"),
      reason: z.string().describe("The reason for the classification"),
    }),
    messages: [
      {
        role: "system",
        content: prompt
      },
      // Add the last 6 messages to the system prompt
      ...messages?.slice(-6),
      {
        role: "user",
        content: `
          QUESTÃO: ${query}
        `
      }
    ],
  });

  return classification;
}

export default {
  execute
}