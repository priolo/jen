import { AgentRepo } from '@/repository/Agent.js';
import { LLM_MODELS } from '@/types/commons/LlmProviders.js';
import { ChatMessage } from '@/types/commons/RoomActions.js';
import { cohere, createCohere } from '@ai-sdk/cohere';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { generateText, jsonSchema, tool, ToolResultPart, ToolSet } from "ai";
import { LLM_RESPONSE_TYPE, LlmResponse } from '../../types/commons/LlmResponse.js';
import { colorPrint, ColorType } from '../../utils/index.js';
// Uncomment and add these imports as needed:
// import { createOpenAI } from '@ai-sdk/openai';
// import { createAnthropic } from '@ai-sdk/anthropic';
// import { createCohere } from '@ai-sdk/cohere';



/**
 * Co-ReAct agent that can solve problems by thinking step by step.
 * The agent can use a set of tools and functions to reason and solve tasks.
 * The agent can also interact with other agents to solve complex problems.
 * Can ask info from the parent agent 
 */
class AgentLlm {

	constructor(
		public agent: Partial<AgentRepo>,
	) {
	}

	public async ask(history: ChatMessage[]): Promise<LlmResponse> {

		if (!history) return null


		let provider = null
		switch (this.agent?.llm?.code) {
			case LLM_MODELS.GOOGLE_GEMINI_2_0_FLASH:
			case LLM_MODELS.GOOGLE_GEMINI_2_0_FLASH_PRO:
			case LLM_MODELS.GOOGLE_GEMINI_2_5_PRO_EXP:
				provider = createGoogleGenerativeAI({
					apiKey: this.agent.llm.key ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
				});
				break;
			case LLM_MODELS.COHERE_COMMAND_R_PLUS:
				provider = createCohere({
					apiKey: this.agent.llm.key ?? process.env.COHERE_API_KEY,
				})
				break
			case LLM_MODELS.MISTRAL_LARGE:
			default:
				provider = createMistral({
					apiKey: this.agent.llm.key ?? process.env.MISTRAL_API_KEY,
				});
				break;
		}
		let model = null
		switch (this.agent?.llm?.code) {
			case LLM_MODELS.GOOGLE_GEMINI_2_0_FLASH:
				model = provider('gemini-2.0-flash')
				break;
			case LLM_MODELS.GOOGLE_GEMINI_2_0_FLASH_PRO:
				model = provider('gemini-2.0-flash-pro')
				break;
			case LLM_MODELS.GOOGLE_GEMINI_2_5_PRO_EXP:
				model = provider('gemini-2.5-pro-exp-03-25')
				break;
			case LLM_MODELS.COHERE_COMMAND_R_PLUS:
				model = provider('command-r-plus')
				break;
			case LLM_MODELS.MISTRAL_LARGE:
			default:
				model = provider('mistral-large-latest')
				break
		}

		const systemPrompt = this.getReactSystemPrompt()
		const systemTools = this.getSystemTools()
		const subagentTools = this.createSubAgentsTools()
		const agentTools = this.createTools()
		const tools = { ...agentTools, ...subagentTools, ...systemTools }

		// eseguo LLM
		let r: Awaited<ReturnType<typeof generateText>>
		try {
			r = await generateText({
				model: model,
				temperature: 0,
				system: systemPrompt,
				messages: history,
				//toolChoice: !this.parent? "auto": "required",
				//toolChoice: this.history.length > 2 && !!this.parent ? "auto" : "required",
				toolChoice: "required",
				tools,
				// maxSteps replaced - in v5, single step execution is default behavior
			})
		} catch (err) {
			console.error("LLM ERROR:", err)
			return <LlmResponse>{
				responseRaw: null,
				type: LLM_RESPONSE_TYPE.FAILURE,
				continue: false,
				content: {
					result: "Unprocessable Entity"
				},
			}
		}

		// ricavo il messaggio di risposta - v5 structure
		const lastStep = r.steps[r.steps.length - 1]
		
		// Check if we have tool calls in the last step
		if (lastStep.toolCalls && lastStep.toolCalls.length > 0) {
			const toolCall = lastStep.toolCalls[0]
			const toolName = toolCall.toolName
			const toolInput = toolCall.input
			
			// Check if we also have tool results
			if (lastStep.toolResults && lastStep.toolResults.length > 0) {
				const toolResult = lastStep.toolResults[0]
				const result = toolResult.output // v5 uses 'output' instead of 'result'
				
				// FINAL RESPONSE
				if (toolName == "final_answer") {
					colorPrint(
						[this.agent.name, ColorType.Blue], " : final answer: ",
						[result, ColorType.Green]
					)
					return <LlmResponse>{
						responseRaw: r.steps,
						type: LLM_RESPONSE_TYPE.COMPLETED,
						continue: false,
						content: {
							result: result
						},
					}
				}

				// COLLECT INFORMATION
				if (toolName == "ask_for_information") {
					colorPrint(
						[this.agent.name, ColorType.Blue], " : ask for information: ",
						[result, ColorType.Yellow]
					)
					return <LlmResponse>{
						responseRaw: r.steps,
						type: LLM_RESPONSE_TYPE.NEED_MORE_INFO,
						continue: false,
						content: result,
					}
				}

				// EXECUTING A TOOL
				colorPrint(
					[this.agent.name, ColorType.Blue], " : ", [toolName, ColorType.Cyan], " : ",
					[result, ColorType.Green]
				)
				return <LlmResponse>{
					responseRaw: r.steps,
					type: LLM_RESPONSE_TYPE.TOOL_CALL,
					continue: true,
					content: {
						toolCall: toolName,
						args: toolInput,
						response: result
					},
				}
			} else {
				// Tool call without result - need to execute tool
				colorPrint(
					[this.agent.name, ColorType.Blue], " : tool call: ", [toolName, ColorType.Cyan],
					" args: ", [toolInput, ColorType.Gray]
				)
				return <LlmResponse>{
					responseRaw: r.steps,
					type: LLM_RESPONSE_TYPE.TOOL_CALL,
					continue: true,
					content: {
						toolCall: toolName,
						args: toolInput,
					},
				}
			}
		}

		// NO TOOL CALL - this is unexpected in required tool mode
		const textResponse = lastStep.text || ''
		colorPrint(
			[this.agent.name, ColorType.Blue], " : unknown : ",
			[textResponse, ColorType.Magenta]
		)
		return <LlmResponse>{
			responseRaw: r.steps,
			type: LLM_RESPONSE_TYPE.UNKNOWN,
			continue: true,
		}

	}


	getSystemTools(): ToolSet {
		const tools = {
			final_answer: tool({
				description: "Provide the final answer to the problem",
				parameters: jsonSchema({
					type: "object",
					properties: { answer: { type: "string", description: "The complete, final answer to the problem" } },
					required: ["answer"]
				}),
				execute: async (args: any) => {
					return args.answer
				}
			}),

			ask_for_information: tool({
				description: `You can use this procedure if you don't have enough information from the user.
For example: 
User: "give me the temperature where I am now". You: "where are you now?", User: "I am in Paris"
`,
				parameters: jsonSchema({
					type: "object",
					properties: {
						request: {
							type: "string",
							description: "The question to ask to get useful information."
						}
					},
					required: ["request"]
				}),
				execute: async (args: any) => {
					return args.request
				}
			}),

			update_strategy: tool({
				description: "Set up a strategy consisting of a list of steps to follow to solve the main problem.", // and try to minimize the use of tools preferring 'reasoning'. ",
				parameters: jsonSchema({
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
				description: "Process the available data and generate useful data to answer the main question. For example, you can filter the data, group it, find relationships and generate a new data set.",
				parameters: jsonSchema({
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

		if (!this.agent.askInformation) delete tools.ask_for_information

		return tools
	}

	createSubAgentsTools() {
		if (!(this.agent?.subAgents?.length > 0)) return {}

		const structs: ToolSet = {}
		for (const subAgent of this.agent.subAgents) {
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
				parameters: jsonSchema(toolRepo.parameters),
				execute: async (args) => {
					return { id: toolRepo.id, args }
				}
			})
		}
		return structs
	}





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
		// const parentContextPrompt = this.agent.base?.getContextPrompt() ?? ""
		// return `${parentContextPrompt}\n${this.agent.contextPrompt ?? ""}`

		return this.agent.contextPrompt ?? ""
	}

}

export default AgentLlm
