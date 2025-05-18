import { google } from '@ai-sdk/google';
import { mistral } from "@ai-sdk/mistral"
import { cohere } from "@ai-sdk/cohere"
import { CoreMessage, generateText, tool, ToolSet } from "ai";
import dotenv from 'dotenv';
import { z } from "zod";
import { colorPrint, ColorType } from '../../utils.js';
dotenv.config();



//const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

//type FunctionsSets = { [key: string]: (args: any) => Promise<string> }

export enum RESPONSE_TYPE {
	SUCCESS,
	FAILURE,
	REQUEST,
}

export interface Response {
	text: string
	type: RESPONSE_TYPE
}

export interface AgentOptions {
	/** Descrive l'agent nel tool */
	descriptionPrompt?: string
	/** contesto nel prompt iniziale */
	contextPrompt?: string
	/** indica come formattare la risposta finale */
	contextAnswerPrompt?: string
	/** aggiunta al system prompt */
	systemPrompt?: string


	tools?: ToolSet
	agents?: Agent[]
	/** distruggi history quando ha risposto */
	clearOnResponse?: boolean
	/** non chiedere al parent */
	noAskForInformation?: boolean
	/** numero massimo di cicli di reasoning */
	maxCycles?: number
}


/**
 * Co-ReAct agent that can solve problems by thinking step by step.
 * The agent can use a set of tools and functions to reason and solve tasks.
 * The agent can also interact with other agents to solve complex problems.
 * Can ask info from the parent agent 
 */
class Agent {
	constructor(
		public name: string,
		options: AgentOptions,
	) {
		const defaultOptions = this.getOptions() ?? {}
		this.options = {
			...defaultOptions,
			...options,
			tools: { ...defaultOptions.tools ?? {}, ...options.tools ?? {} },
			agents: [...defaultOptions.agents ?? [], ...options.agents ?? []],
		}

		//this.model = google('gemini-2.5-pro-exp-03-25')
		this.model = google('gemini-2.0-flash')
		//this.model = mistral('mistral-large-latest')
		//this.model = cohere('command-r-plus')

		this.subagentTools = this.createSubAgentsTools(options.agents)
	}

	public parent: Agent | null = null
	private model = null
	private history: CoreMessage[] = []
	private subagentTools: ToolSet = {}
	protected options: AgentOptions = {}
	protected strategy: string = ""

	private createSubAgentsTools(agents: Agent[]) {
		if (!agents) return {}
		const structs = agents.reduce<ToolSet>((acc, agent) => {

			agent.parent = this

			acc[`chat_with_${agent.name}`] = tool({
				description: `Ask agent ${agent.name} for info.\n${agent.options.descriptionPrompt ?? ""}`,
				parameters: z.object({
					question: z.string().describe(`The question to ask the agent. Fill in all the information needed for a complete answer.`),
					//reason: z.string().describe(`The general context for which the question needs to be answered. Include the reason for asking the question to optimize the answer. For  example "all prime numbers" "only numbers less than 100" ask "all prime numbers less than 100"`),
				}),
				execute: async ({ question/*, reason*/ }) => {
					// let prompt = !!this.parent?.strategy ? `## The USER's strategy that he would like to carry out is:\n${this.parent.strategy}` : ""
					// prompt += "\n\n## Please solve the following problem using reasoning and the available tools:\n" + question
					const prompt = question

					colorPrint([this.name, ColorType.Blue],
						" : chat_with : ", [agent.name, ColorType.Blue],
						" : ", [prompt, ColorType.Green],
					)

					const response = await agent.ask(prompt, true)
					if (response.type == RESPONSE_TYPE.REQUEST) {
						return `Helpful information to answer:\n${response.text}`
					} else if (response.type == RESPONSE_TYPE.FAILURE) {
						return `failed to answer`
					}

					// if (response.type == RESPONSE_TYPE.REQUEST) {
					// 	return `${agent.name} asks: ${response.text}`
					// } else if (response.type == RESPONSE_TYPE.FAILURE) {
					// 	return `${agent.name} failed to answer: ${response.text}`
					// }
					//return `Take this information into consideration to REFLECTION and answer the main question\n${response.text}`
					return response.text
				},
			})

			return acc
		}, {})
		return structs
	}

	async build() { }

	async ask(prompt: string, fromAgent?: boolean): Promise<Response> {
		const systemTools = this.getSystemTools()
		const tools = { ...this.options.tools, ...this.subagentTools, ...systemTools }
		const systemPrompt = this.getReactSystemPrompt()

		if (this.history.length == 0) {
			prompt = this.getContextPrompt()
				+ (this.options.contextAnswerPrompt ? "\n" + this.options.contextAnswerPrompt : "")
				//+ ((!!this.parent?.strategy) ? `\n## The USER's strategy that he would like to carry out is:\n${this.parent?.strategy}` : "")
				+ "\n## Please solve the following problem using MAIN PROCESS:\n"
				+ prompt;
		}
		this.history.push({ role: "user", content: `${prompt}` })

		// LOOP
		for (let i = 0; i < this.options.maxCycles; i++) {

			// THINK
			const r = await generateText({
				model: this.model,
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
					colorPrint([this.name, ColorType.Blue], " : final answer: ", [result, ColorType.Green])
					this.options.agents.forEach(agent => {
						return agent.kill()
					})
					if (this.options.clearOnResponse) this.kill()
					return <Response>{
						text: result,
						type: RESPONSE_TYPE.SUCCESS
					}
				}

				// COLLECT INFORMATION
				if (functionName == "ask_for_information") {
					colorPrint([this.name, ColorType.Blue], " : ask info: ", [result, ColorType.Green])
					return <Response>{
						text: result,
						type: RESPONSE_TYPE.REQUEST
					}
				}

				// ANOTHER TOOL
				if (functionName != "update_strategy" && functionName != "get_reasoning" && !functionName.startsWith("chat_with_")) {
					const funArgs = this.history[this.history.length - 2]?.content[0]?.["args"]
					colorPrint([this.name, ColorType.Blue], " : function : ", [functionName, ColorType.Yellow], " : ", [JSON.stringify(funArgs), ColorType.Green])
					//console.log(result)
				}

				// CONTINUE RAESONING
			} else {
				colorPrint([this.name, ColorType.Blue], " : reasoning : ", [JSON.stringify(lastMessage.content), ColorType.Magenta])
			}

			await new Promise(resolve => setTimeout(resolve, 5000)) // wait 1 second
		}

		colorPrint([this.name, ColorType.Blue], " : ", ["failure", ColorType.Red])
		if (this.options.clearOnResponse) this.kill()
		return {
			text: "I can't answer because the question is too complex.",
			type: RESPONSE_TYPE.FAILURE
		}
	}

	/** elimina la history */
	kill() {
		this.history = []
		colorPrint([this.name, ColorType.Blue], " : ", ["killed", ColorType.Red])
		this.options.agents.forEach(agent => agent.kill())
	}

	protected getOptions(): AgentOptions {
		return {
			descriptionPrompt: "",
			contextPrompt: "",
			tools: {},
			agents: [],
			clearOnResponse: false,
			maxCycles: 30,
		}
	}

	protected getSystemTools(): ToolSet {
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
					colorPrint([this.name, ColorType.Blue], " : update_strategy : ", ["\n" + strategy, ColorType.Magenta])
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
					colorPrint([this.name, ColorType.Blue], " : reasoning : ", ["\n" + thought, ColorType.Magenta])
					this.strategy = thought
					return thought
				}
			}),
		}
		if (!!this.options.noAskForInformation) delete tools.ask_for_information
		return tools
	}


	// PROMPTS

	//#region SYSTEM PROMPT

	/** System instructions for ReAct agent  */
	protected getReactSystemPrompt(): string {
		const prompt = `# YOU ARE: ${this.name}.
${this.options.descriptionPrompt ?? ""}		
You are a ReAct agent that solves problems by thinking step by step with reasoning.

${this.getRulesPrompt()}

${this.options.systemPrompt ?? ""}

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
		if (this.options.agents?.length > 0) {
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
		return `${parentContextPrompt}\n${this.options.contextPrompt ?? ""}`
	}

}

export default Agent
