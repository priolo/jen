import { google } from '@ai-sdk/google';
import { mistral } from "@ai-sdk/mistral"
import { cohere } from "@ai-sdk/cohere"
import { CoreMessage, generateText, tool, ToolSet, jsonSchema } from "ai";
import dotenv from 'dotenv';
import { z } from "zod";
import { colorPrint, ColorType } from '../utils/index.js';
import { Agent } from '@/repository/Agent.js';
import { Llm } from '@/repository/Llm.js';
import { Tool } from '@/repository/Tool.js';

dotenv.config();



export enum RESPONSE_TYPE {
	SUCCESS,
	FAILURE,
	REQUEST,
}

export interface Response {
	text: string
	type: RESPONSE_TYPE
}

export interface Resolver {
	fnGetLlm: (id: string) => Llm
	fnGetAgent: (id: string) => Agent
	fnGetTools: (id: string) => Tool
}


/**
 * Co-ReAct agent that can solve problems by thinking step by step.
 * The agent can use a set of tools and functions to reason and solve tasks.
 * The agent can also interact with other agents to solve complex problems.
 * Can ask info from the parent agent 
 */
class AgentExe {

	constructor(
		//public name: string,
		public agent: Partial<Agent>,
		public history: CoreMessage[] = [],
		public resolver: Resolver,
		public parent?: AgentExe,
	) {
	}

	strategy: string = ""

	protected agentResolve(): Agent {
		if (!this.agent?.name) {
			this.agent = this.resolver.fnGetAgent(this.agent.id)
		}
		return this.agent as Agent
	}

	protected addPrompt(prompt: string) {
		if (!this.history) this.history = []
		if (prompt) {
			this.history.push({ role: "user", content: prompt })
		}
	}


	async ask(prompt: string, fromAgent?: boolean): Promise<Response> {

		this.agentResolve()
		const llm = this.resolver.fnGetLlm(this.agent.llmId)
		const model = google('gemini-2.0-flash', { } )
		//this.model = google('gemini-2.5-pro-exp-03-25')
		//this.model = google('gemini-2.0-flash')
		//this.model = mistral('mistral-large-latest')
		//this.model = cohere('command-r-plus')

		const systemPrompt = this.getReactSystemPrompt()

		const systemTools = this.getSystemTools()
		const subagentTools = this.createSubAgentsTools()
		const agentTools = this.createTools()
		const tools = { ...agentTools, ...subagentTools, ...systemTools }

		// START USER PROMPT
		if (this.history.length == 0) {
			prompt = this.getContextPrompt()
				//+ (this.options.contextAnswerPrompt ? "\n" + this.options.contextAnswerPrompt : "")
				//+ ((!!this.parent?.strategy) ? `\n## The USER's strategy that he would like to carry out is:\n${this.parent?.strategy}` : "")
				+ "\n## Please solve the following problem using MAIN PROCESS:\n"
				+ prompt;
		}
		this.history.push({ role: "user", content: `${prompt}` })

		// LOOP
		for (let i = 0; i < 10; i++) {

			const r = await generateText({
				model: model,
				temperature: 0,
				system: systemPrompt,
				messages: this.history,
				//toolChoice: !this.parent? "auto": "required",
				//toolChoice: this.history.length > 2 && !!this.parent ? "auto" : "required",
				toolChoice: "required",
				tools,
				maxSteps: 1,
			})

			const lastMessage = r.response.messages[r.response.messages.length - 1]
			this.history.push(...r.response.messages)

			if (lastMessage.role == "tool") {
				const content = lastMessage.content[0]
				const functionName = content.toolName
				const result = content.result as string

				// FINAL RESPONSE
				if (functionName == "final_answer") {
					colorPrint([this.agent.name, ColorType.Blue], " : final answer: ", [result, ColorType.Green])
					return <Response>{
						text: result,
						type: RESPONSE_TYPE.SUCCESS
					}
				}

				// COLLECT INFORMATION
				if (functionName == "ask_for_information") {
					colorPrint([this.agent.name, ColorType.Blue], " : ask info: ", [result, ColorType.Green])
					return <Response>{
						text: result,
						type: RESPONSE_TYPE.REQUEST
					}
				}

				// ANOTHER TOOL
				if (functionName != "update_strategy" && functionName != "get_reasoning" && !functionName.startsWith("chat_with_")) {
					const funArgs = this.history[this.history.length - 2]?.content[0]?.["args"]
					colorPrint([this.agent.name, ColorType.Blue], " : function : ", [functionName, ColorType.Yellow], " : ", [JSON.stringify(funArgs), ColorType.Green])
				}

				// CONTINUE RAESONING
			} else {
				colorPrint([this.agent.name, ColorType.Blue], " : reasoning : ", [JSON.stringify(lastMessage.content), ColorType.Magenta])
			}

			await new Promise(resolve => setTimeout(resolve, 5000)) // wait 1 second

		}

		colorPrint([this.agent.name, ColorType.Blue], " : ", ["failure", ColorType.Red])
		return {
			text: "I don't know how to answer the question. I need more information or a different approach.",
			type: RESPONSE_TYPE.FAILURE
		}
	}


	getSystemTools(): ToolSet {
		const tools = {
			final_answer: tool({
				description: "Provide the final answer to the problem",
				parameters: z.object({
					answer: z.string().describe("The complete, final answer to the problem"),
				}),
				execute: async ({ answer }) => {
					return answer
				}
			}),

			ask_for_information: tool({
				description: `You can use this procedure if you don't have enough information from the user.
For example: 
User: "give me the temperature where I am now". You: "where are you now?", User: "I am in Paris"
`,
				parameters: z.object({
					request: z.string().describe("The question to ask to get useful information.")
				}),
				execute: async ({ request }) => {
					return request
				}
			}),

			update_strategy: tool({
				description: "Set up a strategy consisting of a list of steps to follow to solve the main problem.", // and try to minimize the use of tools preferring 'reasoning'. ",
				parameters: z.object({
					strategy: z.string().describe("the strategy divided into a list of steps"),
				}),
				execute: async ({ strategy }) => {
					colorPrint([this.agent.name, ColorType.Blue], " : update_strategy : ", ["\n" + strategy, ColorType.Magenta])
					this.strategy = strategy
					return strategy
				}
			}),

			get_reasoning: tool({
				description: "Process the available data and generate useful data to answer the main question. For example, you can filter the data, group it, find relationships and generate a new data set.",
				parameters: z.object({
					thought: z.string().describe("The new data elaborated by reasoning"),
				}),
				execute: async ({ thought }) => {
					colorPrint([this.agent.name, ColorType.Blue], " : reasoning : ", ["\n" + thought, ColorType.Magenta])
					this.strategy = thought
					return thought
				}
			}),
		}
		if (!this.agent.askInformation) delete tools.ask_for_information
		return tools
	}

	createSubAgentsTools() {
		if (!(this.agent?.subAgents?.length > 0)) return {}

		const structs = this.agent.subAgents.reduce<ToolSet>((acc, subAgent) => {

			const subAgentExe = new AgentExe(subAgent, [], this.resolver, this)
			subAgentExe.agentResolve()

			acc[`chat_with_${subAgentExe.agent.name}`] = tool({
				description: `Ask agent ${subAgentExe.agent.name} for info.\n${subAgentExe.agent.description ?? ""}`,
				// parameters: z.object({
				// 	question: z.string().describe(`The question to ask the agent. Fill in all the information needed for a complete answer.`),
				// }),
				parameters: jsonSchema({
					type: "object",
					properties: {
						question: {
							type: "string",
							description: `The question to ask the agent. Fill in all the information needed for a complete answer.`,
						},
					},
					required: ["question"],
				}),
				execute: async (args, options) => {
					const { question } = args as { question: string };
					colorPrint([subAgentExe.agent.name, ColorType.Blue],
						" : chat_with : ", [subAgentExe.agent.name, ColorType.Blue],
						" : ", [question, ColorType.Green],
					)

					const response = await subAgentExe.ask(question)

					if (subAgentExe.agent.killOnResponse) {
						subAgentExe.history = []
						colorPrint([subAgentExe.agent.name, ColorType.Blue], " : ", ["killed", ColorType.Red])
					}
					if (response.type == RESPONSE_TYPE.REQUEST) {
						return `Helpful information to answer:\n${response.text}`

					} else if (response.type == RESPONSE_TYPE.FAILURE) {
						return `failed to answer`
					}

					return response.text
				},
			})

			return acc
		}, {})
		return structs
	}

	createTools(): ToolSet {
		return this.agent.tools?.reduce<ToolSet>((acc, toolPart) => {
			const toolPoco = this.resolver.fnGetTools(toolPart.id)
			const func = new Function("args", toolPoco.code)
			acc[toolPoco.name] = tool({
				description: toolPoco.description,
				parameters: jsonSchema(toolPoco.parameters),
				execute: async (args) => {
					colorPrint([this.agent.name, ColorType.Blue], " : tool : ", [toolPoco.name, ColorType.Yellow], " : ", [JSON.stringify(args), ColorType.Green])
					const ret =  func(args)
					return ret instanceof Promise ? await ret : ret
				}
			})
			return acc
		}, {} as ToolSet) ?? {}
	}


	// PROMPTS

	//#region SYSTEM PROMPT

	/** System instructions for ReAct agent  */
	protected getReactSystemPrompt(): string {
		const prompt = `# YOU ARE: ${this.agent.name}.
${this.agent.description ?? ""}		
You are a ReAct agent that solves problems by thinking step by step with reasoning.

${this.getRulesPrompt()}

${this.agent.systemPrompt ?? ""}

Always be explicit in your reasoning. Break down complex problems into steps.
`;
		return prompt
	}
	// ## YOUR MAIN PROCESS:
	// - Keep the focus on the main problem and the tools at your disposal
	// - Break the main problem into smaller problems (steps)
	// - Create a list of steps to follow to solve the main problem call the tool "update_strategy"
	// - The steps are designed to minimize the tools used.

	protected getRulesPrompt(): string {
		const rules = []

		//rules.push(`THOUGHT: Analyze the step problem and think about how to solve it.`)

		rules.push(`REASONING: Process the information at your disposal with the "get_reasoning" tool`)

		rules.push(`CHECK: If all the information obtained can answer the question, call the tool "final_answer" and answer the question`)

		rules.push(`UPDATE STRATEGY: If necessary, update your strategy with the "update_strategy" tool and go to 1. REASONING. Otherwise go to the next step`)

		//rules.push(`KEEP IN MIND: try to minimize the use of tools preferring 'reasoning' for example check if you have alredy all information for previus tools make filtering or grouping`)



		const strategyTools = this.getToolsStrategyPrompt()
		if (strategyTools.length > 0) {
			rules.push(`TOOLS USAGE: Preferably use this strategy to call the tools:\n${strategyTools}`)
		}
		if (this.agent.subAgents?.length > 0) {
			rules.push(`RETRIEVE INFORMATION: First use "chat_with_<agent_name>" if the agent can help you otherwise choose another available tool.`)
		} else {
			rules.push(`RETRIEVE INFORMATION: Choose one of the available tools to solve the problem.`)
		}

		//rules.push(`VERIFY: BE CAREFUL! If you already have all the information DO NOT call a tool again asking for the same thing. For example: If You ask a tool for all the numbers from 1 to 10 and then I have to remove the odd numbers. You don't have to ask the tool for the numbers from 1 to 10 again but do the exclusion of the odd numbers yourself!`)

		// if (!this.options.noAskForInformation) {
		// 	rules.push(`REQUEST INFORMATION: If you can't get information from the tools or you have doubts or think you can optimize your search, call the "ask_for_information" tool to ask for more information.`)
		// }

		//rules.push(`CHECK: Try to make exclusions or groupings and if by integrating the information obtained with the tools with those you already have at your disposal you can answer the question`)

		rules.push(`LOOP: Repeat rules 1. REASONING until you can provide a FINAL ANSWER`)

		//rules.push(`FINAL ANSWER: When ready, use the "final_answer" tool to provide your solution.`)

		const rulesPrompt = rules.map((r, i) => `${i + 1}. ${r}`).join("\n")

		return `## YOUR MAIN PROCESS: SO FOLLOW THESE RULES IN LOOP:\n${rulesPrompt}`
	}

	protected getToolsStrategyPrompt(): string {
		return ""
	}

	//#endregion SYSTEM PROMPT

	protected getContextPrompt(): string {
		const parentContextPrompt = this.parent?.getContextPrompt() ?? ""
		return `${parentContextPrompt}\n${this.agent.contextPrompt ?? ""}`
	}

}

export default AgentExe
