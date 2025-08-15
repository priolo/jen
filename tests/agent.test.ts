import { ToolResultPart } from "ai";
import { IAgentRepo } from "../src/repository/Agent.js";
import { ChatMessage } from "../src/types/RoomActions.js";
import { ContentAskTo, ContentCompleted, ContentTool, Response, RESPONSE_TYPE } from '../src/services/agents/types.js';
import AgentLlm from '../src/services/agents/AgentLlm.js';



describe("Test on AGENT", () => {


	beforeAll(async () => {
	})

	afterAll(async () => {
	})

	test("Test semplice domanda", async () => {

		// creo un agente
		const agentRepo = {
			id: "id-1",
			name: "generic",
		}
		const agent = new AgentLlm(agentRepo)

		const history: ChatMessage[] = [
			{ role: "user", content: "write 42" },
		]

		const resp = await agent.ask(history)

		expect(resp.type).toBe(RESPONSE_TYPE.COMPLETED)
		expect((<ContentCompleted>resp.content).answer).toBe("42")

	}, 100000)

	test("Test con tool", async () => {
		// creo un agente
		const agentRepo = <IAgentRepo>{
			id: "id-1",
			name: "gneric",
			tools: [
				{
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
			],
		}
		const agent = new AgentLlm(agentRepo)

		const history: ChatMessage[] = [
			{ role: "user", content: "How much is 2+2? Just write the result." },
		]
		let resp: Response;
		do {
			resp = await agent.ask(history)
			history.push(...resp.response)
			if (resp.type === RESPONSE_TYPE.TOOL) {
				const args = (<ContentTool>resp.content).args;
				const toolResult = args.a + args.a
				const lastMsg = history[history.length - 1];
				(lastMsg.content[0] as ToolResultPart).result = toolResult.toString();
			}
		} while (resp.continue)

		expect(resp.type).toBe(RESPONSE_TYPE.COMPLETED)
		expect((<ContentCompleted>resp.content).answer).toBe("4")

	}, 100000)


	test("call subagent", async () => {

		// creo l'agente sub
		const agentAdder = <IAgentRepo>{
			id: "id-2",
			name: "adder",
			description: "I'm an agent who can do additions well",
		}
		// creo l'agente leader
		const agentLead = <IAgentRepo>{
			id: "id-1",
			name: "lead",
			subAgents: [agentAdder],
		}
		const agents: IAgentRepo[] = [agentAdder, agentLead]

		const agentLeadExe = new AgentLlm(agentLead)
		const history: ChatMessage[] = [
			{ role: "user", content: "How much is 2+2? Just write the result." },
		]
		let resp: Response
		// ciclo leader
		do {
			resp = await agentLeadExe.ask(history)
			history.push(...resp.response)
			if (resp.type === RESPONSE_TYPE.ASK_TO) {

				// ciclo sub-agente
				const agentSub = new AgentLlm(agents.find(a => a.id === (<ContentAskTo>resp.content).agentId))
				const historySub: ChatMessage[] = [
					{ role: "user", content: (<ContentAskTo>resp.content).question },
				]
				let respSub:Response;
				do {
					respSub = await agentSub.ask(historySub)
					historySub.push(...respSub.response)

				} while (respSub.continue);
				// ---

				const lastMsg = history[history.length - 1];
				(<ToolResultPart>lastMsg.content[0]).result = (<ContentCompleted>respSub.content).answer;

			}

			//await new Promise(resolve => setTimeout(resolve, 5000)) // wait 1 second

		} while (resp.continue)

		expect(resp.type).toBe(RESPONSE_TYPE.COMPLETED)
		expect((<ContentCompleted>resp.content).answer).toBe("4")

	}, 100000)
})