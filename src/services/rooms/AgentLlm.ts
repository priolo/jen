import { AgentRepo } from '../../repository/Agent.js';
import { ChatMessage } from '../../types/commons/RoomActions.js';
import { time } from '@priolo/jon-utils';
import { generateText, jsonSchema, ModelMessage, tool, ToolResultPart, ToolSet } from "ai";
import { LLM_RESPONSE_TYPE, LlmResponse } from '../../types/commons/LlmResponse.js';
import { getHistory, getModel } from '../agents/utils/vercel.js';
import { IAgent } from './IAgent.js';



/**
 * Co-ReAct agent that can solve problems by thinking step by step.
 * The agent can use a set of tools and functions to reason and solve tasks.
 * The agent can also interact with other agents to solve complex problems.
 * Can ask info from the parent agent 
 */
class AgentLlm implements IAgent {

	constructor(
		/** POCO di riferimento */
		public agent: AgentRepo,
	) {
	}

	public async ask(history: ChatMessage[]): Promise<LlmResponse> {

		if (!history) return null

		// STARTUP
		const model = getModel(this.agent.llm)
		const systemPrompt = this.getSystemPrompt()
		const systemTools = this.getSystemTools()
		const subagentTools = this.createSubAgentsTools()
		const agentTools = this.createTools()
		const tools = { ...agentTools, ...subagentTools, ...systemTools }


		// TRANSFORM TO VERCEL HISTORY
		const vercelHistory: ModelMessage[] = getHistory(history)

		// LLM GENERATE
		let r: Awaited<ReturnType<typeof generateText>>
		try {
			r = await generateText({
				model: model,
				temperature: 0,
				system: systemPrompt,
				messages: vercelHistory,
				//toolChoice: !this.parent? "auto": "required",
				//toolChoice: this.history.length > 2 && !!this.parent ? "auto" : "required",
				toolChoice: "required",
				tools,
				//stopWhen: ({ steps }) => steps.length >= 1, // Updated from maxSteps: 1
			})
		} catch (err) {
			return <LlmResponse>{
				//responseRaw: null,
				type: LLM_RESPONSE_TYPE.FAILURE,
				continue: false,
				content: {
					result: err
				},
			}
		}

		await time.delay(500) // per evitare problemi di rate limit

		// ricavo il messaggio di risposta
		const messages = r.response.messages
		const lastMsg: ModelMessage = messages[r.response.messages.length - 1]

		// NON E' UN TOOL situazione imprevista... continua a ragionare 
		if (lastMsg.role != "tool") {
			return <LlmResponse>{
				//responseRaw: messages,
				type: LLM_RESPONSE_TYPE.UNKNOWN,
				continue: true,
			}
		}


		// DALLA RISPOSTA RECUPERO I DATI UTILI
		const content = lastMsg.content[0] as ToolResultPart
		const toolName: string = content.toolName
		// per il momento gestisco solo i text
		const result: any = 'value' in content.output ? content.output.value : (content.output as any).reason


		// FINAL RESPONSE
		if (toolName == "final_answer") {
			return <LlmResponse>{
				//responseRaw: messages,
				type: LLM_RESPONSE_TYPE.COMPLETED,
				continue: false,
				content: {
					result: result
				},
			}
		}

		// COLLECT INFORMATION
		if (toolName == "ask_for_information") {
			return <LlmResponse>{
				type: LLM_RESPONSE_TYPE.ASK_TO,
				//responseRaw: messages,
				continue: true,
				content: {
					agentId: this.agent.id, // l'agente che ha chiesto l'informazione
					question: result,
				},
			}
		}

		// CALL AGENT
		if (toolName.startsWith("chat_with_")) {
			const { question, agentId } = result as { question: string, agentId: string }
			return <LlmResponse>{
				type: LLM_RESPONSE_TYPE.ASK_TO,
				//responseRaw: messages,
				continue: true,
				content: {
					agentId: agentId,
					agentName: toolName.replace("chat_with_", ""),
					question: question,
				},
			}
		}

		// UPDATE STRATEGY
		if (toolName == "update_strategy") {
			return <LlmResponse>{
				type: LLM_RESPONSE_TYPE.STRATEGY,
				//responseRaw: messages,
				continue: true,
				content: {
					result: result,
				},
			}
		}

		// REASONING 
		if (toolName == "get_reasoning") {
			return <LlmResponse>{
				type: LLM_RESPONSE_TYPE.REASONING,
				//responseRaw: messages,
				continue: true,
				content: {
					result: result,
				},
			}
		}

		// E' un TOOL GENERICO
		return <LlmResponse>{
			type: LLM_RESPONSE_TYPE.TOOL,
			//responseRaw: messages,
			continue: true,
			content: {
				toolName: toolName,
				toolId: result.id,
				args: result.args,
			},
		}
	}


	getSystemTools(): ToolSet {
		const tools = {
			final_answer: tool({
				description: "Provide the final answer to the problem",
				inputSchema: jsonSchema({
					type: "object",
					properties: { answer: { type: "string", description: "The complete, final answer to the problem" } },
					required: ["answer"]
				}),
				execute: async (args: any) => {
					return args.answer
				}
			}),

			// 			ask_for_information: tool({
			// 				description: `You can use this procedure if you don't have enough information from the user.
			// For example: 
			// User: "give me the temperature where I am now". You: "where are you now?", User: "I am in Paris"
			// `,
			// 				inputSchema: jsonSchema({
			// 					type: "object",
			// 					properties: {
			// 						request: {
			// 							type: "string",
			// 							description: "The question to ask to get useful information."
			// 						}
			// 					},
			// 					required: ["request"]
			// 				}),
			// 				execute: async (args: any) => {
			// 					return args.request
			// 				}
			// 			}),

			update_strategy: tool({
				description: "Set up a strategy consisting of a list of steps to follow to solve the main problem.", // and try to minimize the use of tools preferring 'reasoning'. ",
				inputSchema: jsonSchema({
					type: "object",
					properties: {
						strategy: {
							type: "string",
							description: "The strategy divided into a list of steps."
						}
					},
					required: ["strategy"]
				}),
				execute: async (args: any) => {
					return args.strategy
				}
			}),

			get_reasoning: tool({
				description: "Process the available data and generate useful data to answer the main question. For example, you can filter the data, group it, find relationships and generate a new data set",
				inputSchema: jsonSchema({
					type: "object",
					properties: {
						thought: {
							type: "string",
							description: `The new data elaborated by reasoning`,
						},
					},
					required: ["thought"],
				}),
				execute: async (args: any) => {
					return args.thought
				}
			}),
		}

		//if (!this.agent.askInformation) delete tools.ask_for_information

		return tools
	}

	createSubAgentsTools(): ToolSet {
		if (!(this.agent?.subAgents?.length > 0)) return {}

		const structs: ToolSet = {}
		for (const subAgent of this.agent.subAgents) {
			structs[`chat_with_${subAgent.name}`] = tool({
				description: `Ask agent ${subAgent.name} for info.\n${subAgent.description ?? ""}`,
				inputSchema: jsonSchema({
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
					return { question, agentId: subAgent.id, }
				},
			})
		}
		return structs
	}

	createTools(): ToolSet {
		const structs: ToolSet = {}
		if (!this.agent?.tools) return structs

		for (const toolRepo of this.agent.tools) {
			structs[toolRepo.name] = tool({
				description: toolRepo.description,
				inputSchema: jsonSchema(toolRepo.parameters),
				execute: async (args) => {
					return { id: toolRepo.id, args }
				}
			})
		}
		return structs
	}





	//#region SYSTEM PROMPT

	public overrideSystemPrompt: (systemPrompt: string) => string = null

	/** System instructions for ReAct agent  */
	protected getSystemPrompt(): string {
		const prompt = `# YOU ARE: ${this.agent.name}.
${this.agent.description ?? ""}		
You are a ReAct agent that solves problems by thinking step by step with reasoning.

${this.getRulesPrompt()}

${this.agent.systemPrompt ?? ""}

Always be explicit in your reasoning. Break down complex problems into steps.
`;

		if (this.overrideSystemPrompt) return this.overrideSystemPrompt(prompt)
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
		// const parentContextPrompt = this.agent.base?.getContextPrompt() ?? ""
		// return `${parentContextPrompt}\n${this.agent.contextPrompt ?? ""}`

		return this.agent.contextPrompt ?? ""
	}

}

export default AgentLlm

