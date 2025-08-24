import { LlmRepo } from "@/repository/Llm.js";
import { LLM_MODELS } from "@/types/commons/LlmProviders.js";
import { createCohere } from "@ai-sdk/cohere";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createOllama } from 'ollama-ai-provider-v2';

import dotenv from 'dotenv';

dotenv.config();



export function getModel(llm: LlmRepo) {

	let provider = null
	switch (llm?.name) {
		case LLM_MODELS.GOOGLE_GEMINI_2_0_FLASH:
		case LLM_MODELS.GOOGLE_GEMINI_2_0_FLASH_PRO:
		case LLM_MODELS.GOOGLE_GEMINI_2_5_PRO_EXP:
		case LLM_MODELS.GOOGLE_GEMMA_3_27B:
			provider = createGoogleGenerativeAI({
				apiKey: llm.key ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
			});
			break;
		case LLM_MODELS.COHERE_COMMAND_R_PLUS:
			provider = createCohere({
				apiKey: llm.key ?? process.env.COHERE_API_KEY,
			})
			break
		case LLM_MODELS.OLLAMA_LLAMA_3_2_3B:
			provider = createOllama({
				baseURL: 'http://127.0.0.1:11434/api',
			});
			break;
		case LLM_MODELS.MISTRAL_LARGE:
			provider = createMistral({
				apiKey: llm.key ?? process.env.MISTRAL_API_KEY,
			});
			break;
	}


	let model = null
	switch (llm?.name) {
		case LLM_MODELS.GOOGLE_GEMINI_2_0_FLASH:
			model = provider('gemini-2.0-flash')
			break;
		case LLM_MODELS.GOOGLE_GEMINI_2_0_FLASH_PRO:
			model = provider('gemini-2.0-flash-pro')
			break;
		case LLM_MODELS.GOOGLE_GEMINI_2_5_PRO_EXP:
			model = provider('gemini-2.5-pro-exp-03-25')
			break;
		case LLM_MODELS.GOOGLE_GEMMA_3_27B:
			model = provider('gemma-3-27b-it')
			break
		case LLM_MODELS.COHERE_COMMAND_R_PLUS:
			model = provider('command-r-plus')
			break;
		case LLM_MODELS.OLLAMA_LLAMA_3_2_3B:
			model = provider('llama3.2:3b')
			break;
		case LLM_MODELS.MISTRAL_LARGE:
			model = provider('mistral-large-latest')
			break
	}
	return model
}