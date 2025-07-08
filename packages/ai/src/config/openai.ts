import { createOpenAI } from "@ai-sdk/openai"

const openaiModel = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const openai = openaiModel("gpt-4o")