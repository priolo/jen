import { randomUUID } from 'crypto';
import { AgentRepo } from '../src/repository/Agent.js';
import { RoomRepo } from '../src/repository/Room.js';
import { ToolRepo } from '../src/repository/Tool.js';
import IRoomsChats from '../src/routers/IRoomsChats.js';
import ChatNode from '../src/services/rooms/ChatNode.js';



describe("Test on CHAT", () => {

	const addTool: ToolRepo = {
		id: "id-tool-1",
		name: "addition",
		description: "A simple tool that adds two numbers",
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
		id: "id-1",
		name: "adder",
		description: "Agent who can do additions well",
		tools: [addTool],
	}
	const agentMathRepo: AgentRepo = {
		id: "id-2",
		name: "math",
		description: "Agent who deals with mathematics",
		subAgents: [agentAdderRepo],
	}
	const agentLeadRepo: AgentRepo = {
		id: "id-3",
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
		sendMessageToClient: (clientAddress, result) => {
			console.log(`SEND MESSAGE TO: ${clientAddress}`, result)
		}
	}

	beforeAll(async () => {
	})

	afterAll(async () => {
	})

	test("semplice domanda", async () => {
		const chat = new ChatNode(nodeSym)
		await chat.enterClient("client-1", "id-3")
		await chat.userMessage(
			"client-1",
			`Don't answer directly, but use the tools available to you.
What is 2+2? Just write the answer number.`
		)
		await chat.complete()

	}, 100000)

})