import { createOpenAI } from "@ai-sdk/openai"

const openaiModel = createOpenAI({
  apiKey: "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",
})

export const openai = openaiModel("gpt-4o")