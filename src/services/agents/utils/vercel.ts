import { LlmRepo } from "@/repository/Llm.js";
import { LLM_MODELS } from "@/types/commons/LlmProviders.js";
import { ContentAskTo, ContentTool, LLM_RESPONSE_TYPE, LlmResponse } from "@/types/commons/LlmResponse.js";
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

		if (message.content.type == LLM_RESPONSE_TYPE.TOOL || message.content.type == LLM_RESPONSE_TYPE.ASK_TO) {
			const modelMsgs = message.content.responseRaw as ModelMessage[]
			const result = (<ContentTool>message.content.content).result
			updateVercelToolResponse(modelMsgs, result)
		} else {

		}

		return message.content.responseRaw as ModelMessage[]
	})
	return vercelHistory
}


/**
 * Trasformo una HISTORY di tipo ChatMessage in una per VERCEL/AI
 */
export function getHistory2(history: ChatMessage[]): ModelMessage[] {
	const vercelHistory: ModelMessage[] = history.reduce<ModelMessage[]>((acc, message) => {

		if ((typeof message.content) == "string") {
			return [
				...acc,
				{ role: message.role, content: message.content } as UserModelMessage
			]
		}

		const toolName = getToolNameByResponse(message.content)

		return [
			...acc,
			{
				role: "assistant",
				content: [{
					type: "tool-call",
					toolName: toolName,
					input: (message.content as any).content
				}]
			} as ModelMessage,
			{
				role: "tool",
				content: [{
					type: "tool-result",
					toolName: toolName,
					output: {
						type: "text",
						value: "..."
					}
				}]
			} as ModelMessage,
		]

	}, [])
	return vercelHistory
}


function getToolNameByResponse(response: LlmResponse): string {

	switch (response.type) {
		case LLM_RESPONSE_TYPE.COMPLETED:
			return "final_answer"
		case LLM_RESPONSE_TYPE.FAILURE:
			return "tool"
		case LLM_RESPONSE_TYPE.STRATEGY:
			return "update_strategy"
		case LLM_RESPONSE_TYPE.REASONING:
			return "get_reasoning"
		case LLM_RESPONSE_TYPE.ASK_TO:
			const askToResponse = response.content as ContentAskTo
			return `chat_with_${askToResponse.agentName ?? askToResponse.agentId}`
		default:
			const toolResponse = response.content as ContentTool
			return toolResponse.toolName
	}

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
