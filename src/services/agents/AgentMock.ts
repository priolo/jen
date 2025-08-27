import { AgentRepo } from '@/repository/Agent.js';
import { ChatMessage } from '@/types/commons/RoomActions.js';
import { LLM_RESPONSE_TYPE, LlmResponse } from '../../types/commons/LlmResponse.js';



/**
 */
class AgentMock {

	constructor(
		public agent: Partial<AgentRepo>,
	) {
	}

	public async ask(history: ChatMessage[]): Promise<LlmResponse> {

		if (!history) return null

		const lastMessage = history[history.length - 1];

		if (lastMessage.role == "user") {
			// se l'ultimo messaggio è dell'utente, rispondo con un messaggio fisso
			const answer = `This is a mock response from agent ${this.agent.name}. You said: "${lastMessage.content}"`;
			return <LlmResponse>{
				responseRaw: null,
				type: LLM_RESPONSE_TYPE.COMPLETED,
				continue: false,
				content: {
					answer: answer
				},
			}
		}

	}
}

export default AgentMock

const actions = [
	{
		role: "user",
		content: `Don't answer directly, but use the tools available to you.
What is 2+2? Just write the answer number.`,
	},
	{
		id: "c9580f24-fb44-421c-9ce5-50a844fee237",
		role: "agent",
		content: {
			type: 6,
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
	},
	{
		id: "4cee7dec-0459-457f-8995-a3d54f3e7eda",
		role: "agent",
		content: {
			type: 4,
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
	},
	{
		id: "366c3c9e-70ed-4237-ad0a-457a9528c73b",
		role: "agent",
		content: {
			type: 6,
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
	},
	{
		id: "603540c7-b86f-4e15-a1d5-db70a3b4c5cf",
		role: "agent",
		content: {
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
			type: 0,
			continue: false,
			content: {
				answer: "4",
			},
		},
	},
]

const actions2 = [
	{
		id: "b8c1f11a-e36e-45ea-af1d-192a57f7a52d",
		role: "agent",
		content: {
			type: 6,
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
		id: "1c953d78-225e-45c2-b1fc-9b17692547f1",
		role: "agent",
		content: {
			type: 3,
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
	},
	{
		id: "6ea8a772-e603-4c65-ba3e-962af93747e8",
		role: "agent",
		content: {
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
			type: 0,
			continue: false,
			content: {
				answer: "2 + 2 = 4",
			},
		},
	},
]