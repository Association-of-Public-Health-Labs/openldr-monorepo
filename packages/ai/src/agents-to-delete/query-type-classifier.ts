import { generateObject } from "ai";
import { openai } from "../config/openai"
import { z } from "zod"
import { hivViralLoadPrompt } from "@/prompts/viralload";

interface QueryTypeClassifierProps {
  query: string;
}

export async function queryTypeClassifier({query}: QueryTypeClassifierProps) {
  const { object: classification } = await generateObject({
    model: openai,
    schema: z.object({
      type: z.enum(["qualitative", "quantitative", "unknown"]),
    }),
    prompt: hivViralLoadPrompt(query),
  });

  console.log("Classification: ", classification);

  return classification;
}