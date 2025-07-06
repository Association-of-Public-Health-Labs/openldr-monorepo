import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: '${API_KEY_REF}',
});

export default {openrouter};