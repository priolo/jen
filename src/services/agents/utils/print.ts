import { ContentAskTo, ContentTool, LLM_RESPONSE_TYPE, LlmResponse } from "../../../types/commons/LlmResponse.js"
import { colorPrint, ColorType } from "../../../utils/index.js"



export function printLlmResponse(name: string, response: LlmResponse): void {

	switch (response.type) {

		case LLM_RESPONSE_TYPE.FAILURE: {
			colorPrint(
				[name, ColorType.Blue], " : failure : ",
				[response.content.result, ColorType.Red]
			)
		} break

		default:
		case LLM_RESPONSE_TYPE.UNKNOWN: {
			colorPrint(
				[name, ColorType.Blue], " : unknown : ",
				[JSON.stringify(response.content), ColorType.Magenta]
			)
		} break

		case LLM_RESPONSE_TYPE.COMPLETED: {
			colorPrint(
				[name, ColorType.Blue], " : final answer: ",
				[response.content.result, ColorType.Green]
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
			colorPrint([
				name, ColorType.Blue], " : strategy : ",
				[response.content.result, ColorType.Magenta]
			)
		} break

		case LLM_RESPONSE_TYPE.REASONING: {
			colorPrint(
				[name, ColorType.Blue], " : reasoning : ",
				[response.content.result, ColorType.Magenta]
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