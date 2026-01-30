import { LLM_RESPONSE_TYPE, LlmResponse } from "@shared/types/LlmResponse.js";



const mathResponses: LlmResponse[] = [
	{
		type: LLM_RESPONSE_TYPE.REASONING,
		responseRaw: [
			{
				role: "assistant",
				content: [
					{
						type: "tool-call",
						toolCallId: "88TzaYxkkcfama9i",
						toolName: "get_reasoning",
						input: {
							thought: "The user is asking a simple addition question.",
						},
					},
				],
			},
			{
				role: "tool",
				content: [
					{
						type: "tool-result",
						toolCallId: "88TzaYxkkcfama9i",
						toolName: "get_reasoning",
						output: {
							type: "text",
							value: "The user is asking a simple addition question.",
						},
					},
				],
			},
		],
		continue: true,
		content: {
			result: "The user is asking a simple addition question.",
		},
	},
	{
		type: LLM_RESPONSE_TYPE.TOOL,
		responseRaw: [
			{
				role: "assistant",
				content: [
					{
						type: "tool-call",
						toolCallId: "iPYVXRXh0WVGGdL5",
						toolName: "sum",
						input: {
							a: 2,
							b: 2,
						},
					},
				],
			},
			{
				role: "tool",
				content: [
					{
						type: "tool-result",
						toolCallId: "iPYVXRXh0WVGGdL5",
						toolName: "sum",
						output: {
							type: "json",
							value: {
								content: [
									{
										type: "text",
										text: "4",
									},
								],
							},
						},
						result: {
							content: [
								{
									type: "text",
									text: "4",
								},
							],
						},
					},
				],
			},
		],
		continue: true,
		content: {
			toolName: "sum",
			toolId: "id-tool-1",
			args: {
				a: 2,
				b: 2,
			},
			result: {
				content: [
					{
						type: "text",
						text: "4",
					},
				],
			},
		},
	},
	{
		type: LLM_RESPONSE_TYPE.COMPLETED,
		responseRaw: [
			{
				role: "assistant",
				content: [
					{
						type: "tool-call",
						toolCallId: "RK1drv2OWh8BgYNW",
						toolName: "final_answer",
						input: {
							answer: "2 + 2 = 4",
						},
					},
				],
			},
			{
				role: "tool",
				content: [
					{
						type: "tool-result",
						toolCallId: "RK1drv2OWh8BgYNW",
						toolName: "final_answer",
						output: {
							type: "text",
							value: "2 + 2 = 4",
						},
					},
				],
			},
		],
		continue: false,
		content: {
			result: "2 + 2 = 4",
		},
	}
]

export default mathResponses