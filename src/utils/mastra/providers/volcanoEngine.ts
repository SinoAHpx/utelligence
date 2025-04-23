import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const volcano = createOpenAICompatible({
    name: 'Volcano Engine',
    apiKey: process.env.VLLM_API_KEY,
    baseURL: process.env.VLLM_URL!,
});