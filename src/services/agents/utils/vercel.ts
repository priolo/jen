import { LlmRepo } from "@/repository/Llm.js";
import { LLM_MODELS } from "@/types/commons/LlmProviders.js";
import { ContentTool, LLM_RESPONSE_TYPE } from "@/types/commons/LlmResponse.js";
import { ChatMessage } from "@/types/commons/RoomActions.js";
import { envInit } from "@/types/env.js";
import { createCohere } from "@ai-sdk/cohere";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { ModelMessage, UserModelMessage } from "ai";
import { createOllama } from 'ollama-ai-provider-v2';



envInit();

/**
 * Istanzio un MODELLO LLM in base alla configurazione
 */
export function getModel(llm?: LlmRepo) {

	const name = llm?.name
	const key = llm?.key
	let provider = null

	switch (name) {
		default:
		case LLM_MODELS.GOOGLE_GEMINI_2_0_FLASH:
		case LLM_MODELS.GOOGLE_GEMINI_2_0_FLASH_PRO:
		case LLM_MODELS.GOOGLE_GEMINI_2_5_PRO_EXP:
		case LLM_MODELS.GOOGLE_GEMMA_3_27B:
			provider = createGoogleGenerativeAI({
				apiKey: key ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
			});
			break;
		case LLM_MODELS.COHERE_COMMAND_R_PLUS:
			provider = createCohere({
				apiKey: key ?? process.env.COHERE_API_KEY,
			})
			break
		case LLM_MODELS.OLLAMA_LLAMA_3_2_3B:
			provider = createOllama({
				baseURL: 'http://127.0.0.1:11434/api',
			});
			break;
		case LLM_MODELS.MISTRAL_LARGE:
			provider = createMistral({
				apiKey: key ?? process.env.MISTRAL_API_KEY,
			});
			break;
	}

	let model = null
	switch (name) {
		default:
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

/**
 * Trasformo una HISTORY di tipo ChatMessage in una per VERCEL/AI
 */
export function getHistory(history: ChatMessage[]): ModelMessage[] {
	const vercelHistory: ModelMessage[] = history.flatMap((message: ChatMessage) => {
		
		if ((typeof message.content) == "string") {
			return { role: message.role, content: message.content } as UserModelMessage
		}

		if ( message.content.type == LLM_RESPONSE_TYPE.TOOL || message.content.type == LLM_RESPONSE_TYPE.ASK_TO ){
			const modelMsgs = message.content.responseRaw as ModelMessage[]
			const result = (<ContentTool>message.content.content).result
			updateVercelToolResponse(modelMsgs, result)
		}

		return message.content.responseRaw as ModelMessage[]
	})
	return vercelHistory
}


/**
 * Inserisce un risultato dentro il tool-result di VERCEL/AI 
 * usato per i TOOL e per gli ASK_TO
 */
function updateVercelToolResponse(responseRaw: ModelMessage[], result: any) {
	const toolContent = responseRaw
		.find(r => r.role == "tool")
		?.content?.find(c => c.type == "tool-result");
	if (!toolContent) return
	toolContent.output = {
		type: (typeof result) == "object" ? "json" : "text",
		value: result,
	};
}
