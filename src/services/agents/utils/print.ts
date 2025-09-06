import { ContentAskTo, ContentCompleted, ContentFailure, ContentReasoning, ContentStrategy, ContentTool, LLM_RESPONSE_TYPE, LlmResponse } from "@/types/commons/LlmResponse.js"
import { colorPrint, ColorType } from "@/utils/index.js"



export function printLlmResponse(name: string, response: LlmResponse): void {

	switch (response.type) {

		case LLM_RESPONSE_TYPE.FAILURE: {
			const content = response.content as ContentFailure
			colorPrint(
				[name, ColorType.Blue], " : failure : ",
				[content.result, ColorType.Red]
			)
		} break

		default:
		case LLM_RESPONSE_TYPE.UNKNOWN: {
			colorPrint(
				[name, ColorType.Blue], " : unknown : ",
				[JSON.stringify(response.responseRaw), ColorType.Magenta]
			)
		} break

		case LLM_RESPONSE_TYPE.COMPLETED: {
			const content = response.content as ContentCompleted
			colorPrint(
				[name, ColorType.Blue], " : final answer: ",
				[content.result, ColorType.Green]
			)
		} break

		case LLM_RESPONSE_TYPE.ASK_TO: {
			const content = response.content as ContentAskTo
			colorPrint(
				[name, ColorType.Blue], " : ask to: ",
				[content.agentId, ColorType.Blue], " : ",
				[content.question, ColorType.Green]
			)
		} break

		case LLM_RESPONSE_TYPE.STRATEGY: {
			const content = response.content as ContentStrategy
			colorPrint([
				name, ColorType.Blue], " : strategy : ",
				[content.result, ColorType.Magenta]
			)
		} break

		case LLM_RESPONSE_TYPE.REASONING: {
			const content = response.content as ContentReasoning
			colorPrint(
				[name, ColorType.Blue], " : reasoning : ",
				[content.result, ColorType.Magenta]
			)
		} break

		case LLM_RESPONSE_TYPE.TOOL: {
			const content = response.content as ContentTool
			colorPrint(
				[name, ColorType.Blue], " : use tool : ",
				[content.toolName ?? content.toolId, ColorType.Yellow], " : ",
				[JSON.stringify(content.args), ColorType.Green]
			)
		} break

	}
}