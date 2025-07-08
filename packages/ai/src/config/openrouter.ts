import { createOpenRouter, LanguageModelV1 } from '@openrouter/ai-sdk-provider';
import { openai } from './openai';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export default {
  chat: (model: string) => openai || openrouter.chat(model) as LanguageModelV1,
  completion: (model: string) => openrouter.completion(model) as LanguageModelV1,
};