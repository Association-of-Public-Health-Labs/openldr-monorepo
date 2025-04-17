import { generateObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { openai } from "../config/openai"
import { z } from "zod"

interface QueryTypeClassifierProps {
  query: string;
}

export async function queryTypeClassifier({query}: QueryTypeClassifierProps) {
  const { object: classification } = await generateObject({
    model: openai,
    schema: z.object({
      reasoning: z.string(),
      type: z.enum(['qualitative', 'quantitative', 'unknown']),
    }),
    prompt: `
      Classify this customer query:
      ${query}

      Determine:
      1. Query type (general, refund, or technical)
      2. Complexity (simple or complex)
      3. Brief reasoning for classification
    `,
  });

  return classification;
}