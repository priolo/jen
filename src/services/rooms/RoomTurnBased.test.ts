import { AgentRepo } from "../../repository/Agent.js";
import { RoomRepo } from "../../repository/Room.js";
import { TOOL_TYPE, ToolRepo } from "../../repository/Tool.js";
import { LLM_RESPONSE_TYPE, LlmResponse } from '../../types/commons/LlmResponse.js';
import RoomTurnBased from './RoomTurnBased.js';



describe("Test on ROOM", () => {

	/**
	 * tool di ADDITION
	 */
	const addTool: ToolRepo = {
		id: "id-tool-1",
		type: TOOL_TYPE.CODE,
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

	/**
	 * Simulo l'esecuzione di un TOOL
	 */
	const toolsExe = (id: string, args: any) => ({
		"id-tool-1": (args: any) => (args.a + args.b).toString()
	}[id]?.(args) ?? null)




	beforeAll(async () => {
	})

	afterAll(async () => {
	})

	test("semplice domanda", async () => {

		const agentRepo: AgentRepo = {
			id: "id-agent-1",
			name: "generic",
		}

		const roomRepo: RoomRepo = {
			id: "id-room-1",
			agents: [agentRepo],
		}

		const room = new RoomTurnBased(roomRepo)
		room.addUserMessage("write 42")
		const resp = await room.getResponse()

		expect(resp).toBeDefined()
		expect(resp.type).toBe(LLM_RESPONSE_TYPE.COMPLETED);
		expect(resp.content.result).toBe("42");

	}, 100000)

	test("semplice domanda con utilizzo di un tool", async () => {

		const agentRepo: AgentRepo = {
			id: "id-agent-1",
			name: "gneric",
			tools: [addTool],
		}

		const roomRepo: RoomRepo = {
			id: "id-room-1",
			history: [],
			agents: [agentRepo],
		}
		const room = new RoomTurnBased(roomRepo)
		room.onTool = (toolId: string, args: any) => toolsExe(toolId, args)

		room.addUserMessage("How much is 2+2? Just write the result.")
		const resp = await room.getResponse()

		expect(resp).toBeDefined()
		expect(resp.type).toBe(LLM_RESPONSE_TYPE.COMPLETED);
		expect(resp.content.result).toBe("4");

	}, 100000)

	test("semplice domanda con call subagent", async () => {

		// creo l'agente sub
		const agentAdderRepo: AgentRepo = {
			id: "id-agent-adder",
			name: "adder",
			description: "I'm an agent who can do additions well",
		}
		// creo l'agente leader
		const agentLeadRepo: AgentRepo = {
			id: "id-agent-lead",
			name: "lead",
			//description: "",
			subAgents: [agentAdderRepo],
		}
		const agentsRepo: AgentRepo[] = [agentAdderRepo, agentLeadRepo]

		// creo la ROOM-MAIN
		const roomRepo: RoomRepo = {
			id: "id-room-main",
			history: [],
			agents: [agentLeadRepo],
		}
		const room = new RoomTurnBased(roomRepo)



		room.onSubAgent = async (requestAgentId, agentId, question) => {
			const agentRepo = agentsRepo.find(a => a.id === agentId)!
			const room = new RoomTurnBased({
				id: "sub-room",
				history: [],
				agents: [agentRepo],
			})
			room.addUserMessage(question, requestAgentId)
			const response = await room.getResponse()
			return { response, roomId: room.room.id }
		}

		room.addUserMessage("How much is 2+2? Just write the result.")
		const resp = await room.getResponse()

		expect(resp.type).toBe(LLM_RESPONSE_TYPE.COMPLETED)
		expect(resp.content.result).toBe("4")

	}, 100000)

	test("chiamata ricorsiva ", async () => {

		const agentAdderRepo: AgentRepo = {
			id: "id-agent-adder",
			name: "adder",
			description: "Agent who can do additions well",
			tools: [addTool],
		}
		const agentMathRepo: AgentRepo = {
			id: "id-agent-math",
			name: "math",
			description: "Agent who deals with mathematics",
			subAgents: [agentAdderRepo],
		}
		const agentLeadRepo: AgentRepo = {
			id: "id-agent-lead",
			name: "lead",
			description: "Never respond directly but use the tools at my disposal to answer questions.",
			subAgents: [agentMathRepo],
		}
		const agentsRepo: AgentRepo[] = [agentMathRepo, agentAdderRepo, agentLeadRepo]


		const roomRepoRoot: RoomRepo = {
			id: "id-room-main",
			history: [],
			agents: [agentLeadRepo],
		}
		const question = "How much is 2+2? Just write the result."

		const agentTimeline: string[] = []

		async function recursiveRequest(roomRepo: RoomRepo, question: string): Promise<LlmResponse> {

			// recupero l'agente principale della room
			const roomAgent = roomRepo.agents?.[0]!
			agentTimeline.push(roomAgent?.id ?? "")

			// istanzio la ROOM-REPO
			const room = new RoomTurnBased(roomRepo)
			room.onTool = (toolId, args) => toolsExe(toolId, args)
			room.onSubAgent = async (requestAgentId, agentId, question) => {

				// recupero l'agente che risponde
				const agentRepo = agentsRepo.find(a => a.id === agentId)!

				// creo una ROOM al volo
				const roomRepo: RoomRepo = {
					id: "sub-room",
					history: [],
					agents: [agentRepo],
				}

				// chiamo ricorsivamente la funzione
				return {
					response: await recursiveRequest(roomRepo, question),
					roomId: roomRepo.id
				}
			}

			// inserisco la domanda e chiedo la risposta
			room.addUserMessage(question, roomAgent.id)
			return await room.getResponse()
		}


		const resp = await recursiveRequest(roomRepoRoot, question)
		expect(resp.type).toBe(LLM_RESPONSE_TYPE.COMPLETED)
		expect(resp.content.result).toBe("4")
		expect(agentTimeline).toEqual(["id-agent-lead", "id-agent-math", "id-agent-adder"])

	}, 100000)

})