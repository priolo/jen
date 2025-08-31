import { randomUUID } from 'crypto';
import { AgentRepo } from '../src/repository/Agent.js';
import { RoomRepo } from '../src/repository/Room.js';
import { ToolRepo } from '../src/repository/Tool.js';
import ChatNode from '../src/services/rooms/ChatNode.js';
import IRoomsChats from '../src/services/rooms/IRoomsChats.js';
import { ContentCompleted, LLM_RESPONSE_TYPE } from '../src/types/commons/LlmResponse.js';



describe("Test on CHAT", () => {

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
	const agentsRepo: AgentRepo[] = [agentMathRepo, agentAdderRepo, agentLeadRepo]

	const nodeSym: IRoomsChats = {
		createRoomRepo: async (agents, parentId) => {
			return <RoomRepo>{
				id: randomUUID(),
				parentId: parentId,
				agents: agents || [],
			}
		},
		getAgentRepoById: async (agentId) => {
			return agentsRepo.find(agent => agent.id === agentId) || null
		},
		executeTool: async (toolId, args) => {
			return {
				"id-tool-1": (args: any) => (args.a + args.b).toString()
			}[toolId]?.(args) ?? null
		},
		sendMessageToClient: (clientId, msg) => {
			console.log(`SEND: ${clientId}`, msg)
		}
	}

	beforeAll(async () => {
	})

	afterAll(async () => {
	})

	test("semplice domanda in MAIN-ROOM", async () => {
		const chat = new ChatNode(nodeSym)
		await chat.init(agentLeadRepo.id)
		await chat.enterClient("id-user")
		chat.addUserMessage(
			`Don't answer directly, but use the tools available to you. What is 2+2? Just write the answer number.`,
			"id-user", 
		)
		const response = await chat.complete()

		console.log("Response:", response)
		expect(response).not.toBeNull()
		expect(response?.type).toBe(LLM_RESPONSE_TYPE.COMPLETED)
		expect((<ContentCompleted>response?.content).answer).toBe("4")

	}, 100000)

	test("due LLM parlano tra di loro", async () => {
		const chat = new ChatNode(nodeSym)
		await chat.init(agentLeadRepo.id)
		await chat.enterClient("id-user")
		chat.addUserMessage(
			`Don't answer directly, but use the tools available to you. What is 2+2? Just write the answer number.`,
			"id-user", 
		)
		const response = await chat.complete()

		console.log("Response:", response)
		expect(response).not.toBeNull()
		expect(response?.type).toBe(LLM_RESPONSE_TYPE.COMPLETED)
		expect((<ContentCompleted>response?.content).answer).toBe("4")

	}, 100000)


})