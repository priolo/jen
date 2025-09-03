import { getHistory } from "../src/services/agents/utils/vercel.js";
import { LLM_RESPONSE_TYPE } from "../src/types/commons/LlmResponse.js";
import { ChatMessage } from "../src/types/commons/RoomActions.js";

describe("Test getHistory function", () => {

	test("should convert string content messages to UserModelMessage", () => {


		// Act
		const result = getHistory(history);

		// Assert
		expect(result).toMatchObject([
			{
				role: "user",
				content: "What is 2+2? Just write the answer number.",
			},
			{
				role: "assistant",
				content: [{
					type: "tool-call",
					input: {
						strategy: "I need to add 2 and 2 and then provide the final answer.",
					},
				},],
			},
			{
				role: "tool",
				content: {
					"0": {
						type: "tool-result",
						toolCallId: "a4trQvk8lhxJogxa",
						toolName: "update_strategy",
						output: {
							type: "text",
							value: "I need to add 2 and 2 and then provide the final answer.",
						},
					},
				},
			},
			{
				role: "assistant",
				content: {
					"0": {
						type: "tool-call",
						toolCallId: "VEFMnq5r9iP14qRo",
						toolName: "get_reasoning",
						input: {
							thought: "I need to use the addition tool to add 2 and 2.",
						},
						providerExecuted: undefined,
						providerOptions: undefined,
					},
				},
			},
			{
				role: "tool",
				content: {
					"0": {
						type: "tool-result",
						toolCallId: "VEFMnq5r9iP14qRo",
						toolName: "get_reasoning",
						output: {
							type: "text",
							value: "I need to use the addition tool to add 2 and 2.",
						},
					},
				},
			},
			{
				role: "assistant",
				content: [
					{
						type: "tool-call",
						toolCallId: "9nBUrO5sa9uDtK1E",
						toolName: "addition",
						input: {
							a: 2,
							b: 2,
						},
						providerExecuted: undefined,
						providerOptions: undefined,
					},
				],
			},
			{
				role: "tool",
				content: [
					{
						type: "tool-result",
						toolCallId: "9nBUrO5sa9uDtK1E",
						toolName: "addition",
						output: {
							type: "text",
							value: "4",
						},
					},
				],
			},
			{
				role: "assistant",
				content: [
					{
						type: "tool-call",
						toolCallId: "M80iObx7BVyKrlUS",
						toolName: "get_reasoning",
						input: {
							thought: "The result of 2 + 2 is 4.",
						},
						providerExecuted: undefined,
						providerOptions: undefined,
					},
				],
			},
			{
				role: "tool",
				content: {
					"0": {
						type: "tool-result",
						toolCallId: "M80iObx7BVyKrlUS",
						toolName: "get_reasoning",
						output: {
							type: "text",
							value: "The result of 2 + 2 is 4.",
						},
					},
				},
			},
			{
				role: "assistant",
				content: [
					{
						type: "tool-call",
						toolCallId: "bzTyPeTebEYS1jBo",
						toolName: "final_answer",
						input: {
							answer: "4",
						},
						providerExecuted: undefined,
						providerOptions: undefined,
					},
				],
			},
			{
				role: "tool",
				content: [
					{
						type: "tool-result",
						toolCallId: "bzTyPeTebEYS1jBo",
						toolName: "final_answer",
						output: {
							type: "text",
							value: "4",
						},
					},
				],
			},
		]);

	});


});

const history: ChatMessage[] = [
	{
		id: "5733696c-ddce-4ed6-bce6-8faa006dee05",
		clientId: "id-user",
		role: "user",
		content: "What is 2+2? Just write the answer number.",
	},
	{
		id: "b7ded323-998a-4d39-ba9c-9e2a67a21ab2",
		clientId: "id-agent-1",
		role: "agent",
		content: {
			type: LLM_RESPONSE_TYPE.STRATEGY,
			responseRaw: [
				{
					role: "assistant",
					content: [
						{
							type: "tool-call",
							toolCallId: "a4trQvk8lhxJogxa",
							toolName: "update_strategy",
							input: {
								strategy: "I need to add 2 and 2 and then provide the final answer.",
							},
							providerExecuted: undefined,
							providerOptions: undefined,
						},
					],
				},
				{
					role: "tool",
					content: {
						"0": {
							type: "tool-result",
							toolCallId: "a4trQvk8lhxJogxa",
							toolName: "update_strategy",
							output: {
								type: "text",
								value: "I need to add 2 and 2 and then provide the final answer.",
							},
						},
					},
				},
			],
			continue: true,
			content: {
				strategy: "I need to add 2 and 2 and then provide the final answer.",
			},
		},
	},
	{
		id: "93d90e72-be33-46a3-9c31-a47473c1b2f6",
		clientId: "id-agent-1",
		role: "agent",
		content: {
			type: LLM_RESPONSE_TYPE.REASONING,
			responseRaw: [
				{
					role: "assistant",
					content: {
						"0": {
							type: "tool-call",
							toolCallId: "VEFMnq5r9iP14qRo",
							toolName: "get_reasoning",
							input: {
								thought: "I need to use the addition tool to add 2 and 2.",
							},
							providerExecuted: undefined,
							providerOptions: undefined,
						},
					},
				},
				{
					role: "tool",
					content: {
						"0": {
							type: "tool-result",
							toolCallId: "VEFMnq5r9iP14qRo",
							toolName: "get_reasoning",
							output: {
								type: "text",
								value: "I need to use the addition tool to add 2 and 2.",
							},
						},
					},
				},
			],
			continue: true,
			content: {
				thought: "I need to use the addition tool to add 2 and 2.",
			},
		},
	},
	{
		id: "e45ad96a-ffdd-4e60-bf63-50ef7546bf9e",
		clientId: "id-agent-1",
		role: "agent",
		content: {
			type: LLM_RESPONSE_TYPE.TOOL,
			responseRaw: [
				{
					role: "assistant",
					content: [
						{
							type: "tool-call",
							toolCallId: "9nBUrO5sa9uDtK1E",
							toolName: "addition",
							input: {
								a: 2,
								b: 2,
							},
							providerExecuted: undefined,
							providerOptions: undefined,
						},
					],
				},
				{
					role: "tool",
					content: [
						{
							type: "tool-result",
							toolCallId: "9nBUrO5sa9uDtK1E",
							toolName: "addition",
							output: {
								type: "json",
								value: {
									id: "id-tool-1",
									args: {
										a: 2,
										b: 2,
									},
								},
							},
						},
					],
				},
			],
			continue: true,
			content: {
				toolName: "addition",
				toolId: "id-tool-1",
				args: {
					a: 2,
					b: 2,
				},
				result: "4",
			},
		},
	},
	{
		id: "4bfb2b46-56ff-4752-be67-05270d57e359",
		clientId: "id-agent-1",
		role: "agent",
		content: {
			type: LLM_RESPONSE_TYPE.REASONING,
			responseRaw: [
				{
					role: "assistant",
					content: [
						{
							type: "tool-call",
							toolCallId: "M80iObx7BVyKrlUS",
							toolName: "get_reasoning",
							input: {
								thought: "The result of 2 + 2 is 4.",
							},
							providerExecuted: undefined,
							providerOptions: undefined,
						},
					],
				},
				{
					role: "tool",
					content: {
						"0": {
							type: "tool-result",
							toolCallId: "M80iObx7BVyKrlUS",
							toolName: "get_reasoning",
							output: {
								type: "text",
								value: "The result of 2 + 2 is 4.",
							},
						},
					},
				},
			],
			continue: true,
			content: {
				thought: "The result of 2 + 2 is 4.",
			},
		},
	},
	{
		id: "fdacbf15-3d1b-44a7-aea4-88971e40fade",
		clientId: "id-agent-1",
		role: "agent",
		content: {
			responseRaw: [
				{
					role: "assistant",
					content: [
						{
							type: "tool-call",
							toolCallId: "bzTyPeTebEYS1jBo",
							toolName: "final_answer",
							input: {
								answer: "4",
							},
							providerExecuted: undefined,
							providerOptions: undefined,
						},
					],
				},
				{
					role: "tool",
					content: [
						{
							type: "tool-result",
							toolCallId: "bzTyPeTebEYS1jBo",
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
	},
]
