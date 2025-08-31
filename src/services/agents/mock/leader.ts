import { LLM_RESPONSE_TYPE, LlmResponse } from "@/types/commons/LlmResponse.js";



const leaderResponses: LlmResponse[] = [
	{
		type: LLM_RESPONSE_TYPE.REASONING,
		responseRaw: [
			{
				role: "assistant",
				content: [
					{
						type: "tool-call",
						toolCallId: "MXOlTm4mxC80Ocbx",
						toolName: "get_reasoning",
						input: {
							thought: "I need to calculate the sum of 2 and 2.",
						},
					},
				],
			},
			{
				role: "tool",
				content: [
					{
						type: "tool-result",
						toolCallId: "MXOlTm4mxC80Ocbx",
						toolName: "get_reasoning",
						output: {
							type: "text",
							value: "I need to calculate the sum of 2 and 2.",
						},
					},
				],
			},
		],
		continue: true,
		content: {
			thought: "I need to calculate the sum of 2 and 2.",
		},
	},

	{
		type: LLM_RESPONSE_TYPE.ASK_TO,
		responseRaw: [
			{
				role: "assistant",
				content: [
					{
						type: "tool-call",
						toolCallId: "yRTKEVNYOd8TBhw8",
						toolName: "chat_with_MATH",
						input: {
							question: "What is 2+2?",
						},
					},
				],
			},
			{
				role: "tool",
				content: [
					{
						type: "tool-result",
						toolCallId: "yRTKEVNYOd8TBhw8",
						toolName: "chat_with_MATH",
						output: {
							type: "json",
							value: {
								question: "What is 2+2?",
								agentId: "id-agent-math",
							},
						},
						result: "2 + 2 = 4",
					},
				],
			},
		],
		continue: true,
		content: {
			agentId: "id-agent-math",
			question: "What is 2+2?",
			result: "2 + 2 = 4",
		},
	},

	{
		type: LLM_RESPONSE_TYPE.REASONING,
		responseRaw: [
			{
				role: "assistant",
				content: [
					{
						type: "tool-call",
						toolCallId: "tohFdME0g7l2PYkt",
						toolName: "get_reasoning",
						input: {
							thought: "The MATH agent should respond with the answer to 2+2.",
						},
					},
				],
			},
			{
				role: "tool",
				content: [
					{
						type: "tool-result",
						toolCallId: "tohFdME0g7l2PYkt",
						toolName: "get_reasoning",
						output: {
							type: "text",
							value: "The MATH agent should respond with the answer to 2+2.",
						},
					},
				],
			},
		],
		continue: true,
		content: {
			thought: "The MATH agent should respond with the answer to 2+2.",
		},
	},

	{
		responseRaw: [
			{
				role: "assistant",
				content: [
					{
						type: "tool-call",
						toolCallId: "uokK9OO4FfIZFxgy",
						toolName: "final_answer",
						input: {
							answer: "4",
						},
					},
				],
			},
			{
				role: "tool",
				content: [
					{
						type: "tool-result",
						toolCallId: "uokK9OO4FfIZFxgy",
						toolName: "final_answer",
						output: {
							type: "text",
							value: "4",
						},
					},
				],
			},
		],
		type: LLM_RESPONSE_TYPE.COMPLETED,
		continue: false,
		content: {
			answer: "4",
		},
	},
]

export default leaderResponses