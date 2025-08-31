import { getHistory } from "../src/services/agents/utils/vercel.js";
import { ChatMessage } from "../src/types/commons/RoomActions.js";
import { ModelMessage, UserModelMessage } from "ai";
import { LLM_RESPONSE_TYPE, LlmResponse } from "../src/types/commons/LlmResponse.js";

describe("Test getHistory function", () => {

	test("should convert string content messages to UserModelMessage", () => {
		// Arrange
		const history: ChatMessage[] = [
			{
				id: "msg-1",
				role: "user",
				content: "Hello, how are you?"
			},
			{
				id: "msg-2",
				role: "agent",
				content: "I'm doing well, thank you!"
			},
			{
				id: "msg-3",
				role: "system",
				content: "You are a helpful assistant."
			}
		];

		// Act
		const result = getHistory(history);

		// Assert
		expect(result).toHaveLength(3);
		expect(result[0]).toEqual({
			role: "user",
			content: "Hello, how are you?"
		});
		expect(result[1]).toEqual({
			role: "agent",
			content: "I'm doing well, thank you!"
		});
		expect(result[2]).toEqual({
			role: "system",
			content: "You are a helpful assistant."
		});
	});


});



const history: ChatMessage[] = [
	{
		id: "msg-1",
		role: "agent",
		content: {
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
				thought: "The user is asking a simple addition question.",
			},
		},
	},
	{
		id: "msg-2",
		role: "agent",
		content: {
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
		}
	},
	{
		id: "msg-3",
		role: "agent",
		content: {
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
				answer: "2 + 2 = 4",
			},
		}
	}
]