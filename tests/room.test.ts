import { IAgentRepo } from "../src/repository/Agent.js";
import { RoomRepo } from "../src/repository/Room.js";
import { ContentCompleted, Response, RESPONSE_TYPE } from '../src/services/agents/types.js';
import RoomTurnBased from '../src/services/rooms/RoomTurnBased.js';



describe("Test on ROOM", () => {

	const addTool = {
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
	const toolsExe = (name: string, args: any) => ({
		"addition": (args: any) => (args.a + args.b).toString()
	}[name]?.(args) ?? null)

	beforeAll(async () => {
	})

	afterAll(async () => {
	})

	test("semplice domanda", async () => {

		const agentRepo = <IAgentRepo>{
			id: "id-agent-1",
			name: "generic",
		}

		const roomRepo: RoomRepo = {
			id: "id-room-1",
			history: [],
			agents: [agentRepo],
		}

		const room = new RoomTurnBased(roomRepo)
		room.addUserMessage("write 42")
		const resp = await room.getResponse()

		expect(resp).toBeDefined()
		expect(resp.type).toBe(RESPONSE_TYPE.COMPLETED);
		expect((resp.content as ContentCompleted).answer).toBe("42");

	}, 100000)

	test("semplice domanda con utilizzo di un tool", async () => {

		const agentRepo = <IAgentRepo>{
			id: "id-1",
			name: "gneric",
			tools: [addTool],
		}

		const roomRepo: RoomRepo = {
			id: "id-room-1",
			history: [],
			agents: [agentRepo],
		}
		const room = new RoomTurnBased(roomRepo)
		room.onTool = (name, args) => toolsExe(name, args)

		room.addUserMessage("How much is 2+2? Just write the result.")
		const resp = await room.getResponse()

		expect(resp).toBeDefined()
		expect(resp.type).toBe(RESPONSE_TYPE.COMPLETED);
		expect((resp.content as ContentCompleted).answer).toBe("4");

	})

	test("semplice domanda con call subagent", async () => {

		// creo l'agente sub
		const agentAdderRepo = <IAgentRepo>{
			id: "id-2",
			name: "adder",
			description: "I'm an agent who can do additions well",
		}
		// creo l'agente leader
		const agentLeadRepo = <IAgentRepo>{
			id: "id-1",
			name: "lead",
			subAgents: [agentAdderRepo],
		}
		const agentsRepo: IAgentRepo[] = [agentAdderRepo, agentLeadRepo]


		const roomRepo: RoomRepo = {
			id: "id-room-1",
			history: [],
			agents: [agentLeadRepo],
		}
		const room = new RoomTurnBased(roomRepo)
		room.onSubAgent = async (agentId, question) => {
			const agentRepo = agentsRepo.find(a => a.id === agentId);
			if (!agentRepo) return null;
			const room = new RoomTurnBased({
				id: "sub-room",
				history: [],
				agents: [agentRepo],
			})
			room.addUserMessage(question)
			const resp = await room.getResponse()
			if (resp.type == RESPONSE_TYPE.COMPLETED) {
				return (<ContentCompleted>resp.content).answer
			}
			return null;
		}

		room.addUserMessage("How much is 2+2? Just write the result.")
		const resp = await room.getResponse()

		expect(resp.type).toBe(RESPONSE_TYPE.COMPLETED)
		expect((<ContentCompleted>resp.content).answer).toBe("4")

	}, 100000)


	test("chiamata ricorsiva ", async () => {

		const agentAdderRepo = <IAgentRepo>{
			id: "id-1",
			name: "adder",
			description: "Agent who can do additions well",
			tools: [addTool],
		}
		const agentMathRepo = <IAgentRepo>{
			id: "id-2",
			name: "math",
			description: "Agent who deals with mathematics",
			subAgents: [agentAdderRepo],
		}
		const agentLeadRepo = <IAgentRepo>{
			id: "id-3",
			name: "lead",
			description: "General agent. Never respond directly but use the tools at my disposal to answer questions.",
			subAgents: [agentMathRepo],
		}
		const agentsRepo: IAgentRepo[] = [agentMathRepo, agentAdderRepo, agentLeadRepo]


		const roomRepoRoot: RoomRepo = {
			id: "id-room-1",
			history: [],
			agents: [agentLeadRepo],
		}
		const question = "How much is 2+2? Just write the result."

		const agentTimeline:string[] = []

		async function recursiveRequest(roomRepo: RoomRepo, question: string): Promise<Response> {
			agentTimeline.push(roomRepo?.agents?.[0]?.id ?? "")

			const room = new RoomTurnBased(roomRepo)
			room.onTool = (name, args) => toolsExe(name, args)
			room.onSubAgent = async (agentId, question) => {
				const agentRepo = agentsRepo.find(a => a.id === agentId);
				if (!agentRepo) return null;
				const roomRepo:RoomRepo = {
					id: "sub-room",
					history: [],
					agents: [agentRepo],
				}
				return recursiveRequest(roomRepo, question)
			}
			room.addUserMessage(question)
			return room.getResponse()
		}


		const resp = await recursiveRequest(roomRepoRoot, question)
		expect(resp.type).toBe(RESPONSE_TYPE.COMPLETED)
		expect((<ContentCompleted>resp.content).answer).toBe("4")
		expect(agentTimeline).toEqual(["id-3", "id-2", "id-1"])

	}, 100000)

})