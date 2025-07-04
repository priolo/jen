import AgentExe from "./agents/llm/AgentExe.js";
import { Agent } from "./repository/Agent.js";
import { Llm } from "./repository/Llm.js";
import { Tool } from "./repository/Tool.js";

async function Start() {

	const tool1 = new Tool()
	tool1.id = "tool-01"
	tool1.name = "add"
	tool1.description = "This tool adds two numbers together"
	tool1.parameters = {
		type: "object",
		properties: {
			a: {
				type: "number",
				description: `The first number to add`,
			},
			b: {
				type: "number",
				description: `The second number to add`,
			},
		},
		required: ["a", "b"],
	}
	tool1.code = `return args.a + args.b;`

	const tool2 = new Tool()
	tool2.id = "tool-02"
	tool2.name = "multiply"
	tool2.description = "This tool multiplies two numbers together"
	tool2.parameters = {
		type: "object",
		properties: {
			a: {
				type: "number",
				description: `The first number to multiply`,
			},
			b: {
				type: "number",
				description: `The second number to multiply`,
			},
		},
		required: ["a", "b"],
	}
	tool2.code = `return args.a * args.b;`

	const agent1 = new Agent()
	agent1.id = "agent-01"
	agent1.name = "MATH"
	agent1.description = "This agent can add and multiply numbers"
	agent1.systemPrompt = "You are a test agent that can add and multiply numbers."
	agent1.contextPrompt = ""
	agent1.askInformation = true
	agent1.killOnResponse = true
	agent1.llmDefault = "gemini-2.0-flash"
	agent1.tools = [{ id: tool1.id }, { id: tool2.id }]

	const agent2 = new Agent()
	agent2.id = "agent-02"
	agent2.name = "LEADER"
	agent2.description = "This agent can resolve all problem"
	agent2.systemPrompt = ""
	agent2.contextPrompt = ""
	agent2.askInformation = true
	agent2.killOnResponse = false
	agent2.subAgents = [{ id: agent1.id }]
	agent2.llmDefault = "gemini-2.0-flash"

	const agents = [agent1, agent2]
	const tools = [tool1, tool2]

	const resolver = {
		fnGetAgent: async (id: string) => agents.find(a => a.id === id),
		fnGetTools: async (id: string) => tools.find(t => t.id === id),
	}


	const executer = new AgentExe(
		{ id: agent2.id },
		[],
		resolver,
	)
	const prompt = "What is the result of adding 5 and 10, then multiplying by 2?"
	const response = await executer.ask(prompt)

}


Start()