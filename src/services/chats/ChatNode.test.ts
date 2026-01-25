import "../../startup/envPreload.js"

import { randomUUID } from 'crypto';
import { AgentRepo } from '../../repository/Agent.js';
import { RoomRepo } from '../../repository/Room.js';
import { ToolRepo } from '../../repository/Tool.js';
import { LLM_RESPONSE_TYPE } from '../../types/commons/LlmResponse.js';
import ChatNode from './ChatNode.js';
import { ChatsContext } from "./ChatsContext.js";


describe("Test ChatNode", () => {

	const addTool: ToolRepo = {
		id: "id-tool-1",
		name: "addition",
		description: "This tool adds two numbers",
		parameters: {
			type: "object",
			properties: {
				a: { type: "number", description: "First number" },
				b: { type: "number", description: "Second number" }
			},
			required: ["a", "b"]
		}
	}

	const agentAdderRepo: AgentRepo = {
		id: "id-agent-1",
		name: "adder",
		description: "Agent who can do additions well",
		tools: [addTool],
	}
	const agentMathRepo: AgentRepo = {
		id: "id-agent-2",
		name: "math",
		description: "Agent who deals with mathematics",
		subAgents: [agentAdderRepo],
	}
	const agentLeadRepo: AgentRepo = {
		id: "id-agent-3",
		name: "lead",
		description: "General agent. Never respond directly but use the tools at my disposal to answer questions.",
		subAgents: [agentMathRepo],
	}

	const philosopherRepo: AgentRepo = {
		id: "id-agent-philosopher",
		name: "philosopher",
		description: "You're a philosopher. You know the history of philosophy and its exponents.",
		subAgents: [agentMathRepo],
	}
	const physicistRepo: AgentRepo = {
		id: "id-agent-physicist",
		name: "physicist",
		description: "You're a physicist. You know the history of physic and its exponents.",
		subAgents: [agentMathRepo],
	}

	const agentsRepo: AgentRepo[] = [agentMathRepo, agentAdderRepo, agentLeadRepo, philosopherRepo, physicistRepo]

	class Recorder {
		constructor() { }
		messages: { clientId: string, msg: any }[] = []
		context: ChatsContext = {
			createRoomRepo: async (agents, parentId) => {
				return <RoomRepo>{
					id: randomUUID(),
					parentId: parentId,
					agents: agents || [],
				}
			},
			getAgentRepoById: async (agentId) => {
				return agentsRepo.find(agent => agent.id === agentId)!
			},
			executeTool: async (id: string, args: any) => {
				const tools: { [key: string]: any } = {
					"id-tool-1": (args: any) => (args.a + args.b).toString()
				}
				return tools[id]?.(args) ?? null;
			},
			sendMessageToClient: (clientId, msg) => {
				console.log(`SEND: ${clientId}`, msg)
				this.messages.push({ clientId, msg })
			}
		}
	}

	const nodeSym: ChatsContext = {
		createRoomRepo: async (agents, parentId) => {
			return <RoomRepo>{
				id: randomUUID(),
				parentId: parentId,
				agents: agents || [],
			}
		},
		getAgentRepoById: async (agentId) => {
			return agentsRepo.find(agent => agent.id === agentId)!
		},
		executeTool: async (id: string, args: any) => {
			const tools: { [key: string]: any } = {
				"id-tool-1": (args: any) => (args.a + args.b).toString()
			}
			return tools[id]?.(args) ?? null;
		},
		sendMessageToClient: (clientId, msg) => {
			console.log(`SEND: ${clientId}`, msg)
		}
	}

	beforeEach(() => {
	})

	beforeAll(async () => {
	})

	afterAll(async () => {
	})

	test("domanda in MAIN-ROOM con TOOL", async () => {
		const room = await RoomTurnBase.Build(nodeSym, [agentAdderRepo.id])
		const chat = await ChatNode.Build(nodeSym, room)
		
		await chat.enterClient("id-user")
		chat.addUserMessage(
			`What is 2+2? Just write the answer number.`,
			"id-user",
		)
		const response = await chat.complete()

		console.log("Response:", response)
		expect(response).not.toBeNull()
		expect(response?.type).toBe(LLM_RESPONSE_TYPE.COMPLETED)
		expect(response?.content.result).toBe("4")

	}, 100000)

	test("domanda in MAIN-ROOM con SUB-AGENTS", async () => {
		const recorder = new Recorder()

		const room = await RoomTurnBase.Build(recorder.context, [agentLeadRepo.id])
		const chat = await ChatNode.Build(recorder.context, room)
		await chat.enterClient("id-user")
		chat.addUserMessage(
			`Don't answer directly, but use the tools available to you. What is 2+2? Just write the answer number.`,
			"id-user",
		)
		const response = await chat.complete()

		console.log("Response:", response)
		expect(response).not.toBeNull()
		expect(response?.type).toBe(LLM_RESPONSE_TYPE.COMPLETED)
		expect(response?.content.result).toBe("4")

	}, 10000)

	test("due USER parlano tra di loro", async () => {
		const recorder = new Recorder()

		const room = await RoomTurnBase.Build(recorder.context)
		const chat = await ChatNode.Build(recorder.context, room)

		const user1 = "user-1"
		const user2 = "user-2"

		chat.enterClient(user1)
		chat.addUserMessage(`first message from user 1`, user1)
		chat.enterClient(user2)
		chat.addUserMessage(`first message from user 2`, user2)
		chat.addUserMessage(`second message from user 1`, user1)

		expect(recorder.messages.length).toBeGreaterThan(0)

	}, 10000)

	test("due AGENTs", async () => {

		const recorder = new Recorder()

		const room = await RoomTurnBase.Build(recorder.context, [philosopherRepo.id, physicistRepo.id])
		const chat = await ChatNode.Build(recorder.context, room)

		chat.addUserMessage(`do you like philosophy or physics more?`)
		const response = await chat.complete()

		expect(response).not.toBeNull()
		expect(response?.type).toBe(LLM_RESPONSE_TYPE.COMPLETED)

	}, 10000)

})