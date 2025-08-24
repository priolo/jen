import { McpTool } from "@/services/mcp/types.js"
import { executeMcpTool, getMcpTools } from "@/services/mcp/utils.js"
import ChatNode from "@/services/rooms/ChatNode.js"
import { Bus, typeorm, ws } from "@priolo/julian"
import { randomUUID } from "crypto"
import { AgentRepo } from "../repository/Agent.js"
import { RoomRepo } from "../repository/Room.js"
import { TOOL_TYPE, ToolRepo } from "../repository/Tool.js"
import { BaseC2S, BaseS2C, CHAT_ACTION_C2S, UserEnterC2S, UserLeaveC2S, UserMessageC2S } from "../types/commons/RoomActions.js"
import AgentRoute from "./AgentRoute.js"
import McpServerRoute from "./McpServerRoute.js"
import IRoomsChats from "./IRoomsChats.js"



export type WSRoomsConf = Partial<WSRoomsService['stateDefault']>

/**
 * WebSocket service for managing prompt chat rooms
 */
export class WSRoomsService extends ws.route implements IRoomsChats {

	private chats: ChatNode[] = []

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "ws-rooms",
			repository: "/typeorm/rooms",
			agentRepository: "/typeorm/agents",
			toolRepository: "/typeorm/tools",
			mcpRepository: "/typeorm/mcp_servers",
		}
	}



	//#region SocketCommunicator

	/**
	 * Restituisco solo i client di questa chat
	 */
	private getClient(clientId: string): ws.IClient | undefined {
		const clients = this.getClients()
		return clients.find(c => c.remoteAddress === clientId)
	}

	async onConnect(client: ws.IClient) {
		// qua posso mettere tutti i dati utili al client
		console.log(`Client connected: ${client.remoteAddress}`)
		super.onConnect(client)
	}

	/**
	 * Handle client disconnection
	 */
	onDisconnect(client: ws.IClient) {
		// rimuovo il client da tutte le CHATs
		const chats = [...this.chats]
		for (const chat of chats) {
			this.handleLeave(
				client,
				{ action: CHAT_ACTION_C2S.LEAVE, chatId: chat.id } as UserLeaveC2S
			)
		}
		super.onDisconnect(client)
	}

	//#endregion



	//#region HANDLE CHAT MESSAGES

	/**
	 * Handle incoming WebSocket messages
	 * [II] forse bisogna togliere gli await, ma per ora lascio così
	 */
	async onMessage(client: ws.IClient, message: string) {
		if (!client || !message) return
		const msg = JSON.parse(message) as BaseC2S

		switch (msg.action) {
			case CHAT_ACTION_C2S.ENTER:
				await this.handleEnter(client, msg as UserEnterC2S)
				break
			case CHAT_ACTION_C2S.LEAVE:
				this.handleLeave(client, msg as UserLeaveC2S)
				break
			case CHAT_ACTION_C2S.USER_MESSAGE:
				await this.handleUserMessage(client, msg as UserMessageC2S)
				break
			default:
				console.warn(`Unknown action: ${msg.action}`)
				return
		}

		console.log(`WSPromptService.onMessage`, msg)
	}

	/**
	 * Handle client entering in a chat
	 */
	private async handleEnter(client: ws.IClient, msg: UserEnterC2S) {
		const chat = new ChatNode(this)
		this.chats.push(chat)
		await chat.enterClient(client.remoteAddress, msg.agentId)
	}

	private handleLeave(client: ws.IClient, msg: UserLeaveC2S) {
		const chat = this.getChatById(msg.chatId)
		if (!chat) return this.log(`Chat not found: ${msg.chatId}`)

		const isVoid = chat.removeClient(client.remoteAddress)
		if (isVoid) this.removeChat(chat.id)

		this.log(`Client ${client.remoteAddress} left chat ${msg.chatId}`)
	}

	private async handleUserMessage(client: ws.IClient, msg: UserMessageC2S) {
		const chat = this.getChatById(msg.chatId)
		if (!chat) return this.log(`Chat not found: ${msg.chatId}`)

		chat.userMessage(client.remoteAddress, msg.text)
		if (!msg?.complete) return
		await chat.complete()
	}

	//#endregion 



	//#region IMPLEMENTATION OF RoomsChats INTERFACE

	public async createRoomRepo(agents?: AgentRepo[], parentId?: string): Promise<RoomRepo | null> {
		// per il momento non salvo in DB
		// const room: RoomRepo = await new Bus(this, this.state.repository).dispatch({
		// 	type: typeorm.RepoRestActions.SAVE,
		// 	payload: {
		// 		history: [],
		// 		agents: [],
		// 	}
		// })
		return {
			id: randomUUID() as string,
			parentRoomId: parentId,
			history: [],
			agents: agents ?? [],
		}
	}

	static McpCache: Map<string, McpTool[]> = new Map()

	public async getAgentRepoById(agentId: string): Promise<AgentRepo> {
		const agent: AgentRepo = await AgentRoute.GetById(agentId, this, this.state.agentRepository)

		// [II] --- mettere in una funzione a parte
		// bisogna recuperare la "description" e "parameters"
		for (const tool of agent.tools ?? []) {

			// se il TOOL ha la description e i parameters non c'e' bisogno di caricarli
			if (!!tool.description && !!tool.parameters) continue

			// se nono di tipo MCP allora li cerco in CACHE o li carico
			if ( tool.type == TOOL_TYPE.MCP && !!tool.mcpId) {

				// non sono in CACHE allora li carico e li metto in CACHE
				if (!WSRoomsService.McpCache.has(tool.mcpId)) {
					const mcpServer = await McpServerRoute.GetById(tool.mcpId, this, this.state.mcpRepository)
					if (!mcpServer) continue
					const mcpTools = await getMcpTools(mcpServer.host)
					WSRoomsService.McpCache.set(mcpServer.id, mcpTools)
				}

				// prendo i tools dal CACHE
				const mcpTools = WSRoomsService.McpCache.get(tool.mcpId)
				if (!mcpTools) continue
				const cachedTool = mcpTools.find(t => t.name == tool.name)
				tool.description = cachedTool.description
				tool.parameters = cachedTool.inputSchema
			}
		}
		// [II] --- ---


		return agent
	}

	/**
	 * Esegue un TOOL e ne restituisce il risultato
	 */
	public async executeTool(toolId: string, args: any): Promise<any> {
		const toolRepo: ToolRepo = await new Bus(this, this.state.toolRepository).dispatch({
			type: typeorm.RepoRestActions.GET_BY_ID,
			payload: toolId
		})

		if (!toolRepo) return null;

		if ( toolRepo.type == TOOL_TYPE.CODE ) {
			if (!toolRepo.code) return "Tool without code"
			// eseguo il codice
			try {
				//const func = new Function('args', `return (${toolRepo.code})(args)`)
				const func = new Function(toolRepo.code)
				const result = func(args)
				// Handle both sync and async functions
				return await Promise.resolve(result)
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				return `Tool execution error: ${errorMessage}`
			}
		}

		if (toolRepo.type == TOOL_TYPE.MCP) {
			const mcpServer = await McpServerRoute.GetById(toolRepo.mcpId, this, this.state.mcpRepository)
			if (!mcpServer) return `MCP Server not found: ${toolRepo.mcpId}`
			return await executeMcpTool(mcpServer.host, toolRepo.name, args)
		}
		
		return "Tool type not supported"
	}

	/**
	 * Invia un messaggio ad un client specifico
	 */
	public sendMessageToClient(clientAddress: string, message: BaseS2C) {
		const client = this.getClient(clientAddress)
		if (!client) return
		this.sendToClient(client, JSON.stringify(message))
	}

	//#endregion




	//#region UTILS

	private getChatById(chatId: string): ChatNode | undefined {
		return this.chats.find(c => c.id === chatId)
	}

	/**
	 * Quando un CLIENT lascia la chat se è vuota la rimuove
	 */
	private removeChat(chatId: string): void {
		const index = this.chats.findIndex(c => c.id === chatId)
		if (index !== -1) {
			this.chats.splice(index, 1)
			this.log(`Chat removed: ${chatId}`)
		} else {
			this.log(`Chat not found: ${chatId}`)
		}
	}

	//#endregion

}