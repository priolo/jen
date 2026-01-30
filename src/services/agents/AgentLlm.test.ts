import "../../startup/envPreload.js";

import { LLM_MODELS } from "../../../shared/types/LlmProviders.js";
import { ContentAskTo, ContentTool, LLM_RESPONSE_TYPE, LlmResponse } from "../../../shared/types/LlmResponse.js";
import { ChatMessage } from "../../../shared/types/RoomActions.js";
import { AgentRepo } from "../../repository/Agent.js";
import AgentLlm from "./AgentLlm.js";



describe("Test on AGENT", () => {

	beforeAll(async () => {
	})

	afterAll(async () => {
	})

	test("Test semplice domanda", async () => {

		// creo un agente
		const agentRepo: AgentRepo = {
			id: "agent-1",
			name: "generic",
			llm: { 
				id: "llm-1", 
				code: LLM_MODELS.GROQ_GPT_OSS_20B,
			}, 
		}
		const agent = new AgentLlm(agentRepo)

		const history: ChatMessage[] = [
			{ role: "user", content: "write 42" },
		]

		const resp = await agent.ask(history)

		expect(resp.type).toBe(LLM_RESPONSE_TYPE.COMPLETED)
		expect(resp.content!.result).toBe("42")

	}, 10000)

	test("Test con tool", async () => {
		// creo un agente
		const agentRepo: AgentRepo = {
			id: "agent-1",
			name: "generic",
			llm: { 
				id: "llm-1", 
				code: LLM_MODELS.GROQ_GPT_OSS_20B, 
			},
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
				const content = response.content as ContentTool
				content.result = (+content.args.a) + (+content.args.b);
			}
			history.push({
				role: "agent",
				content: response
			})
		} while (response.continue)

		expect(response.type).toBe(LLM_RESPONSE_TYPE.COMPLETED)
		expect(response.content!.result).toBe("4")

	}, 10000)

	test("call subagent", async () => {

		// creo l'agente sub
		const agentAdder: AgentRepo = {
			id: "agent-2",
			llm: { 
				id: "llm-1", 
				code: LLM_MODELS.GROQ_GPT_OSS_20B, 
			},
			name: "adder",
			description: "I'm an agent who can do additions well",
		}
		// creo l'agente leader
		const agentLead: AgentRepo = {
			id: "agent-1",
			llm: { id: "llm-1", code: LLM_MODELS.MISTRAL_LARGE },
			name: "lead",
			subAgents: [agentAdder],
		}
		const agents: AgentRepo[] = [agentAdder, agentLead]

		const agentLeadExe = new AgentLlm(agentLead)
		const history: ChatMessage[] = [
			{ role: "user", content: "How much is 2+2? Just write the result." },
		]
		let response: LlmResponse

		// ### CICLO LEADER
		do {
			response = await agentLeadExe.ask(history)

			history.push({ role: "agent", content: response })

			if (response.type === LLM_RESPONSE_TYPE.ASK_TO) {

				// ### CICLO SUB-AGENT
				const content = response.content as ContentAskTo
				const agentSub = new AgentLlm(agents.find(a => a.id === content.agentId)!)
				const historySub: ChatMessage[] = [
					{ role: "user", content: content.question },
				]
				let respSub: LlmResponse;
				do {
					respSub = await agentSub.ask(historySub)
					historySub.push({ role: "agent", content: respSub })

				} while (respSub.continue);
				// ---

				// inserisco la risposta:
				response.content.result = respSub.content.result

			}

		} while (response.continue)
		// ---

		expect(response.type).toBe(LLM_RESPONSE_TYPE.COMPLETED)
		expect(response.content?.result).toBe("4")

	}, 10000)

})