import { ToolResultPart } from "ai";
import { AgentRepo } from "../src/repository/Agent.js";
import { ChatMessage } from "../src/types/commons/RoomActions.js";
import { ContentAskTo, ContentCompleted, ContentTool, LlmResponse, LLM_RESPONSE_TYPE } from '../src/services/agents/types.js';
import AgentLlm from '../src/services/agents/AgentLlm.js';
import { LLM_MODELS } from "../src/types/commons/LlmProviders.js";
import { randomUUID } from "crypto";



describe("Test on AGENT", () => {

	beforeAll(async () => {
	})

	afterAll(async () => {
	})



	test("Test semplice domanda", async () => {

		// creo un agente
		const agentRepo:AgentRepo = {
			id: "agent-1",
			name: "generic",
			llm: { id: "llm-1", name: LLM_MODELS.GOOGLE_GEMINI_2_0_FLASH },
		}
		const agent = new AgentLlm(agentRepo)

		const history: ChatMessage[] = [
			{ role: "user", content: "write 42" },
		]

		const resp = await agent.ask(history)

		expect(resp.type).toBe(LLM_RESPONSE_TYPE.COMPLETED)
		expect((<ContentCompleted>resp.content).answer).toBe("42")

	}, 100000)

	test("Test con tool", async () => {
		// creo un agente
		const agentRepo:AgentRepo = {
			id: "agent-1",
			name: "generic",
			llm: { id: "llm-1", name: LLM_MODELS.MISTRAL_LARGE },
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
		let response: LlmResponse;
		do {
			response = await agent.ask(history)
			if (response.type === LLM_RESPONSE_TYPE.TOOL) {
				const args = (<ContentTool>response.content).args;
				const toolResult = (+args.a) + (+args.b);
				const responseTool = response.responseRaw?.find(r => r.role == "tool")
				const contentResult:ToolResultPart = responseTool?.content?.find( c => c.type === "tool-result") as ToolResultPart
				if (contentResult) {
					contentResult.output =  {
					type: "text",
					value: toolResult.toString(),
				}}
			}
			history.push({
				id: randomUUID(),
				role: "agent",
				content: response
			})
		} while (response.continue)

		expect(response.type).toBe(LLM_RESPONSE_TYPE.COMPLETED)
		expect((<ContentCompleted>response.content).answer).toBe("4")

	}, 100000)

	test("call subagent", async () => {

		// creo l'agente sub
		const agentAdder:AgentRepo = {
			id: "agent-2",
			llm: { id: "llm-1", name: LLM_MODELS.GOOGLE_GEMINI_2_0_FLASH },
			name: "adder",
			description: "I'm an agent who can do additions well",
		}
		// creo l'agente leader
		const agentLead:AgentRepo = {
			id: "agent-1",
			llm: { id: "llm-1", name: LLM_MODELS.MISTRAL_LARGE },
			name: "lead",
			subAgents: [agentAdder],
		}
		const agents: AgentRepo[] = [agentAdder, agentLead]

		const agentLeadExe = new AgentLlm(agentLead)
		const history: ChatMessage[] = [
			{ role: "user", content: "How much is 2+2? Just write the result." },
		]
		let response: LlmResponse
		// ciclo leader
		do {
			response = await agentLeadExe.ask(history)

			history.push({ id: randomUUID(), role: "agent", content: response })

			if (response.type === LLM_RESPONSE_TYPE.ASK_TO) {

				// ciclo sub-agente
				const agentSub = new AgentLlm(agents.find(a => a.id === (<ContentAskTo>response.content).agentId))
				const historySub: ChatMessage[] = [
					{ role: "user", content: (<ContentAskTo>response.content).question },
				]
				let respSub:LlmResponse;
				do {
					respSub = await agentSub.ask(historySub)
					historySub.push({ id: randomUUID(), role: "agent", content: respSub })

				} while (respSub.continue);
				// ---

				const lastMsg = history[history.length - 1];
				//(<ToolResultPart>lastMsg.content[0]).result = (<ContentCompleted>respSub.content).answer;

			}

			//await new Promise(resolve => setTimeout(resolve, 5000)) // wait 1 second

		} while (response.continue)

		expect(response.type).toBe(LLM_RESPONSE_TYPE.COMPLETED)
		expect((<ContentCompleted>response.content).answer).toBe("4")

	}, 100000)
})