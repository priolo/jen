import { ChatMessage } from '@shared/types/commons/RoomActions.js';
import { google } from '@ai-sdk/google';
import { generateText, jsonSchema, tool, ToolSet } from "ai";
import { z } from "zod";
import { colorPrint, ColorType } from '../../utils/index.js';


export enum RESPONSE_TYPE {
	SUCCESS,
	FAILURE,
	REQUEST,
}

export interface Response {
	text: string
	type: RESPONSE_TYPE
}

export interface AgentConfig {
	name: string;
	description?: string;
	systemPrompt?: string;
	contextPrompt?: string;
	askInformation?: boolean;
	killOnResponse?: boolean;
}

export interface SubAgent {
	name: string;
	description?: string;
	agent: AgentTest;
}

export interface AgentTool {
	name: string;
	description: string;
	parameters: any;
	execute: (args: any) => Promise<any> | any;
}

/**
 * Simplified agent without TypeORM dependencies.
 * Performs a single ask operation without internal looping.
 * The loop should be handled externally.
 */
class AgentTest {

	constructor(
		public config: AgentConfig,
		public subAgents: SubAgent[] = [],
		public tools: AgentTool[] = [],
		public parent?: AgentTest,
	) {
	}

	public strategy: string = ""
	public roomId: string = null
	public lastSubagentCall: AgentTest = null
	private history: ChatMessage[] = []

	/**
	 * Performs a single ask operation without looping
	 * @param prompt The prompt to process
	 * @returns Promise<Response> with the result
	 */
	async ask(prompt?: string): Promise<Response> {
		if (!this.history?.length && !prompt) return null

		const model = google('gemini-2.0-flash', {})

		const systemPrompt = this.getReactSystemPrompt()

		const systemTools = this.getSystemTools()
		const subagentTools = this.createSubAgentsTools()
		const agentTools = this.createAgentTools()
		const tools = { ...agentTools, ...subagentTools, ...systemTools }

		// START USER PROMPT
		if (this.history.length == 0) {
			prompt = this.getContextPrompt()
				+ "\n## Please solve the following problem using MAIN PROCESS:\n"
				+ prompt;
		}
		
		if (!!prompt) {
			this.history = [...this.history, { role: "user", content: prompt }]
		}

		// Single generation call (no loop)
		const r = await generateText({
			model: model,
			temperature: 0,
			system: systemPrompt,
			messages: this.history,
			toolChoice: "required",
			tools,
			maxSteps: 1,
		})

		const lastMsg: ChatMessage = r.response.messages[r.response.messages.length - 1]
		
		// Check for subagent call
		if (!!this.lastSubagentCall) {
			const callSubagentMsg: ChatMessage = r.response.messages[0]
			callSubagentMsg.roomRefId = this.lastSubagentCall.roomId
		}
		this.lastSubagentCall = null

		// Update history
		this.history = [...this.history, ...r.response.messages]

		if (lastMsg.role == "tool") {
			const content = lastMsg.content[0]
			const functionName = content.toolName
			const result = content.result as string

			// FINAL RESPONSE
			if (functionName == "final_answer") {
				colorPrint([this.config.name, ColorType.Blue], " : final answer: ", [result, ColorType.Green])
				return <Response>{
					text: result,
					type: RESPONSE_TYPE.SUCCESS
				}
			}

			// COLLECT INFORMATION
			if (functionName == "ask_for_information") {
				colorPrint([this.config.name, ColorType.Blue], " : ask info: ", [result, ColorType.Green])
				return <Response>{
					text: result,
					type: RESPONSE_TYPE.REQUEST
				}
			}

			// ANOTHER TOOL
			if (functionName != "update_strategy" && functionName != "get_reasoning" && !functionName.startsWith("chat_with_")) {
				const funArgs = this.history[this.history.length - 2]?.content[0]?.["args"]
				colorPrint([this.config.name, ColorType.Blue], " : function : ", [functionName, ColorType.Yellow], " : ", [JSON.stringify(funArgs), ColorType.Green])
			}

			// Return partial result for external loop handling
			return <Response>{
				text: result,
				type: RESPONSE_TYPE.SUCCESS
			}
		} else {
			colorPrint([this.config.name, ColorType.Blue], " : reasoning : ", [JSON.stringify(lastMsg.content), ColorType.Magenta])
			
			// Return reasoning for external loop handling
			return <Response>{
				text: JSON.stringify(lastMsg.content),
				type: RESPONSE_TYPE.SUCCESS
			}
		}
	}

	/**
	 * Get the current conversation history
	 */
	getHistory(): ChatMessage[] {
		return this.history
	}

	/**
	 * Set the conversation history
	 */
	setHistory(history: ChatMessage[]): void {
		this.history = history
	}

	/**
	 * Clear the conversation history
	 */
	clearHistory(): void {
		this.history = []
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
				description: "Set up a strategy consisting of a list of steps to follow to solve the main problem.",
				parameters: z.object({
					strategy: z.string().describe("the strategy divided into a list of steps"),
				}),
				execute: async ({ strategy }) => {
					colorPrint([this.config.name, ColorType.Blue], " : update_strategy : ", ["\n" + strategy, ColorType.Magenta])
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
					colorPrint([this.config.name, ColorType.Blue], " : reasoning : ", ["\n" + thought, ColorType.Magenta])
					this.strategy = thought
					return thought
				}
			}),
		}
		
		if (!this.config.askInformation) delete tools.ask_for_information
		return tools
	}

	createSubAgentsTools(): ToolSet {
		if (!(this.subAgents?.length > 0)) return {}

		const structs: ToolSet = {}

		for (const subAgent of this.subAgents) {
			structs[`chat_with_${subAgent.name}`] = tool({
				description: `Ask agent ${subAgent.name} for info.\n${subAgent.description ?? ""}`,
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
					colorPrint([subAgent.name, ColorType.Blue],
						" : chat_with : ", [subAgent.name, ColorType.Blue],
						" : ", [question, ColorType.Green],
					)
					
					this.lastSubagentCall = subAgent.agent
					const response = await subAgent.agent.ask(question)

					if (response.type == RESPONSE_TYPE.REQUEST) {
						return `Helpful information to answer:\n${response.text}`
					} else if (response.type == RESPONSE_TYPE.FAILURE) {
						return `failed to answer`
					}

					return response.text
				},
			})
		}
		return structs
	}

	createAgentTools(): ToolSet {
		const structs: ToolSet = {}
		if (!this.tools?.length) return structs

		for (const agentTool of this.tools) {
			structs[agentTool.name] = tool({
				description: agentTool.description,
				parameters: jsonSchema(agentTool.parameters),
				execute: async (args) => {
					colorPrint([this.config.name, ColorType.Blue], " : tool : ", [agentTool.name, ColorType.Yellow], " : ", [JSON.stringify(args), ColorType.Green])
					const ret = agentTool.execute(args)
					return ret instanceof Promise ? await ret : ret
				}
			})
		}
		return structs
	}

	// PROMPTS

	protected getReactSystemPrompt(): string {
		const prompt = `# YOU ARE: ${this.config.name}.
${this.config.description ?? ""}		
You are a ReAct agent that solves problems by thinking step by step with reasoning.

${this.getRulesPrompt()}

${this.config.systemPrompt ?? ""}

Always be explicit in your reasoning. Break down complex problems into steps.
`;
		return prompt
	}

	protected getRulesPrompt(): string {
		const rules = []

		rules.push(`REASONING: Process the information at your disposal with the "get_reasoning" tool`)
		rules.push(`CHECK: If all the information obtained can answer the question, call the tool "final_answer" and answer the question`)
		rules.push(`UPDATE STRATEGY: If necessary, update your strategy with the "update_strategy" tool and go to 1. REASONING. Otherwise go to the next step`)

		const strategyTools = this.getToolsStrategyPrompt()
		if (strategyTools.length > 0) {
			rules.push(`TOOLS USAGE: Preferably use this strategy to call the tools:\n${strategyTools}`)
		}
		
		if (this.subAgents?.length > 0) {
			rules.push(`RETRIEVE INFORMATION: First use "chat_with_<agent_name>" if the agent can help you otherwise choose another available tool.`)
		} else {
			rules.push(`RETRIEVE INFORMATION: Choose one of the available tools to solve the problem.`)
		}

		rules.push(`LOOP: Repeat rules 1. REASONING until you can provide a FINAL ANSWER`)

		const rulesPrompt = rules.map((r, i) => `${i + 1}. ${r}`).join("\n")

		return `## YOUR MAIN PROCESS: SO FOLLOW THESE RULES IN LOOP:\n${rulesPrompt}`
	}

	protected getToolsStrategyPrompt(): string {
		return ""
	}

	protected getContextPrompt(): string {
		const parentContextPrompt = this.parent?.getContextPrompt() ?? ""
		return `${parentContextPrompt}\n${this.config.contextPrompt ?? ""}`
	}
}

export default AgentTest
