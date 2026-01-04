import { McpTool } from "../services/mcp/types.js"
import { executeMcpTool, getMcpTools } from "../services/mcp/utils.js"
import ChatNode from "../services/rooms/ChatNode.js"
import { Bus, typeorm, ws } from "@priolo/julian"
import { TypeLog } from "@priolo/julian/dist/core/types.js"
import { randomUUID } from "crypto"
import { AgentRepo } from "../repository/Agent.js"
import { RoomRepo } from "../repository/Room.js"
import { TOOL_TYPE, ToolRepo } from "../repository/Tool.js"
import { BaseS2C, CHAT_ACTION_C2S, CHAT_ACTION_S2C, ChatCreateC2S, ChatGetByRoomC2S, ChatInfoS2C, RoomAgentsUpdateC2S, RoomCompleteC2S, RoomHistoryUpdateC2S, UserEnterC2S, UserLeaveC2S, UserMessageC2S, UPDATE_TYPE } from "../types/commons/RoomActions.js"
import AgentRoute from "./AgentRoute.js"
import ChatContext from "../services/rooms/ChatContext.js"
import McpServerRoute from "./McpServerRoute.js"
import RoomTurnBased from "../services/rooms/RoomTurnBased.js"
import { log } from "console"
import { FindManyOptions } from "typeorm"



export type WSRoomsConf = Partial<WSRoomsService['stateDefault']>

/**
 * GLOBAL: WebSocket service for managing prompt chat rooms
 * Contiene le CHAT-ROOMS ognuna di queste composta da piu' ROOMS e CLIENTs
 * in pratica è un servizio di CHAT multi-room e multi-agente 
 * gestisce prevalentemente i messaggi
 */
export class WSRoomsService extends ws.route implements ChatContext {

	private chats: ChatNode[] = []

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "ws-rooms",
			room_repo: "/typeorm/rooms",
			agent_repo: "/typeorm/agents",
			tool_repo: "/typeorm/tools",
			mcp_repo: "/typeorm/mcp_servers",
		}
	}
	declare state: typeof this.stateDefault


	//#region SocketCommunicator

	async onConnect(client: ws.IClient) {
		// qua posso mettere tutti i dati utili al client
		super.onConnect(client)
	}

	/**
	 * Handle client disconnection
	 */
	async onDisconnect(client: ws.IClient) {
		// rimuovo il client da tutte le CHATs
		const chats = [...this.chats]
		for (const chat of chats) {
			await this.handleUserLeave(
				client,
				{ action: CHAT_ACTION_C2S.USER_LEAVE, chatId: chat.id } as UserLeaveC2S
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
		let msg = JSON.parse(message)

		if (msg.action === CHAT_ACTION_C2S.CHAT_CREATE) {
			await this.handleChatCreate(client, msg as ChatCreateC2S)
			return
		}

		if (msg.action === CHAT_ACTION_C2S.CHAT_GET_BY_ROOM) {
			await this.handleChatGetByRoom(client, msg as ChatGetByRoomC2S)
			return
		}


		const chat = this.getChatById(msg.chatId)
		if (!chat) throw new Error(`Chat not found: ${msg.chatId}`)

		switch (msg.action) {
			case CHAT_ACTION_C2S.USER_ENTER:
				this.handleUserEnter(client, msg as UserEnterC2S)
				break
			case CHAT_ACTION_C2S.USER_LEAVE:
				this.handleUserLeave(client, msg as UserLeaveC2S)
				break
			// case CHAT_ACTION_C2S.ROOM_COMPLETE:
			// 	await this.handleRoomComplete(client, msg as RoomCompleteC2S)
			// 	break

			case CHAT_ACTION_C2S.ROOM_AGENTS_UPDATE: {
				const msgUp: RoomAgentsUpdateC2S = msg
				chat.updateAgents(msgUp.agentsIds, msgUp.roomId)
				break
			}

			case CHAT_ACTION_C2S.ROOM_HISTORY_UPDATE: {
				const msgUp: RoomHistoryUpdateC2S = msg
				chat.updateHistory(msgUp.updates, msgUp.roomId)
				if (msgUp.updates.some(u => u.content.role == "user" && u.type == UPDATE_TYPE.ADD)) {
					await chat.complete()
				}
				break
			}

			// case CHAT_ACTION_C2S.USER_MESSAGE:
			// 	await this.handleUserMessage(client, msg as UserMessageC2S)
			// 	break

			default:
				console.warn(`Unknown action: ${msg.action}`)
				return
		}

		console.log(`WSPromptService.onMessage`, msg)
	}

	/**
	 * Crea una nuova CHAT.  
	 * Inserisce il CLIENT che l'ha creata
	 * e crea la MAIN-ROOMe ed eventualmente gli AGENTs specificati
	 */
	private async handleChatCreate(client: ws.IClient, msg: ChatCreateC2S) {
		const userId = client?.jwtPayload?.id
		if (!userId) throw new Error(`Invalid userId`)

		// creo chat e room
		const room = await ChatNode.BuildRoom(this, msg.agentIds)
		const chat = await ChatNode.Build(this, [room])

		// salvo la chat e faccio entrare il client
		this.chats.push(chat)
		chat.enterClient(userId)
	}

	/**
	 * Ottiene dalle CHAT esistenti quella che contiene la ROOM specificata
	 * Eventualmente carica i dati dal DB se la ROOM non è in memoria
	 */
	private async handleChatGetByRoom(client: ws.IClient, msg: ChatGetByRoomC2S) {
		const userId = client?.jwtPayload?.id
		if (!userId) throw new Error(`Invalid userId`)

		let chat = this.getChatByRoomId(msg.roomId)

		// non la trovo in memoria quindi carico tutta la CHAT dal DB
		if (!chat) {

			// Carico la ROOM richiesta
			const roomRepo: RoomRepo = await new Bus(this, this.state.room_repo).dispatch({
				type: typeorm.Actions.GET_BY_ID,
				payload: msg.roomId
			})
			if (!roomRepo || !roomRepo.chatId) throw new Error(`Room not found: ${msg.roomId}`)
			// carico tutte le ROOMs di quella CHAT
			const roomsRepo: RoomRepo[] = await new Bus(this, this.state.room_repo).dispatch({
				type: typeorm.Actions.FIND,
				payload: <FindManyOptions<RoomRepo>>{ chatId: roomRepo.chatId }
			})

			// Creo la CHAT con le ROOMs caricate
			const rooms = roomsRepo.map(repo => new RoomTurnBased(repo));
			chat = await ChatNode.Build(this, rooms);
			this.chats.push(chat)
		}

		chat.enterClient(userId)
	}

	/**
	 * Un CLIENT entra in una CHAT. 
	 * Avvete tutti i partecipanti 
	 * Invio al nuovo CLIENT i dati della CHAT
	 */
	private async handleUserEnter(client: ws.IClient, msg: UserEnterC2S) {
		const userId = client?.jwtPayload?.id
		if (!userId) throw new Error(`Invalid userId`)
		const chat = this.getChatById(msg.chatId)
		chat.enterClient(userId)
	}

	/**
	 * Un CLIENT lascia una CHAT
	 * Avverte tutti i partecipanti
	 * Se la CHAT è vuota la elimina
	 */
	private async handleUserLeave(client: ws.IClient, msg: UserLeaveC2S) {
		const chat = this.getChatById(msg.chatId)
		if (!chat) throw new Error(`Chat not found: ${msg.chatId}`)
		const userId = client.jwtPayload?.id
		if (!userId) throw new Error(`Invalid userId`)

		const isVoid = chat.removeClient(userId)
		if (isVoid) await this.removeChat(chat.id)
		this.log(`Client ${userId} left chat ${msg.chatId}`)
	}

	/**
	 * Un CLIENT invia un MESSAGE di tipo USER in una ROOM della CHAT
	 * Inserisce il MESSAGE in HISTORY
	 * Avverte tutti i partecipanti
	 * Chiede il COMPLETE alla ROOM
	 */
	// private async handleUserMessage(client: ws.IClient, msg: UserMessageC2S) {
	// 	const chat = this.getChatById(msg.chatId)
	// 	if (!chat) return this.log("CHAT", `Chat not found: ${msg.chatId}`, TypeLog.ERROR)
	// 	const userId = client?.jwtPayload?.id
	// 	if (!userId) return this.log("CHAT", `Invalid userId`, TypeLog.ERROR)
	// 	chat.addUserMessage(msg.text, userId, msg.roomId)
	// 	await chat.complete()
	// }

	//#endregion 



	//#region ChatContext IMPLEMENTATION 

	/**
	 * Crea una RoomRepo (solo in memoria, non salvata su DB).
	 * Le ROOM verranno salvate sul DB solo quando la CHAT viene eliminata (vedi saveRooms).
	 */
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

	/**
	 * Restitui un AGENT pronto per l'uso
	 */
	public async getAgentRepoById(agentId: string): Promise<AgentRepo> {

		// [II] non va bene! deve raggiungere il nodo con una path!
		const agent: AgentRepo = await AgentRoute.GetById(agentId, this, this.state.agent_repo)

		// [II] --- mettere in una funzione a parte
		// bisogna recuperare la "description" e "parameters" per i TOOLS
		for (const tool of agent.tools ?? []) {

			// se il TOOL ha la description e i parameters non c'e' bisogno di caricarli
			if (!!tool.description && !!tool.parameters) continue

			// se è di tipo MCP allora li cerco in CACHE o li carico
			if (!!tool.mcpId) {

				// non sono in CACHE allora li carico e li metto in CACHE
				if (!WSRoomsService.McpCache.has(tool.mcpId)) {
					// [II] anche questo va ricavato tramite path
					const mcpServer = await McpServerRoute.GetById(tool.mcpId, this, this.state.mcp_repo)
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
		const toolRepo: ToolRepo = await new Bus(this, this.state.tool_repo).dispatch({
			type: typeorm.Actions.GET_BY_ID,
			payload: toolId
		})

		if (!toolRepo) return null;

		if (toolRepo.type == TOOL_TYPE.CODE) {
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
			const mcpServer = await McpServerRoute.GetById(toolRepo.mcpId, this, this.state.mcp_repo)
			if (!mcpServer) return `MCP Server not found: ${toolRepo.mcpId}`
			return await executeMcpTool(mcpServer.host, toolRepo.name, args)
		}

		return "Tool type not supported"
	}

	/**
	 * Invia un messaggio ad un client specifico
	 */
	public sendMessageToClient(clientId: string, message: BaseS2C) {
		const client = this.getClients()?.find(c => c?.jwtPayload?.id == clientId)
		if (!client) return this.log("CHAT", `Client not found: ${clientId}`, TypeLog.ERROR)
		this.sendToClient(client, JSON.stringify(message))
	}

	//#endregion



	//#region UTILS

	/**
	 * Restituisce la CHAT specificata
	 */
	private getChatById(chatId: string): ChatNode | undefined {
		return this.chats.find(c => c.id === chatId)
	}

	/**
	 * Restituisce la CHAT che contiene la ROOM specificata
	 */
	private getChatByRoomId(roomId: string): ChatNode | undefined {
		return this.chats.find(c => !!c.getRoomById(roomId))
	}

	/**
	 * Quando un CLIENT lascia la chat se è vuota la rimuove
	 * Prima di rimuovere, salva tutte le ROOM sul DB
	 */
	private async removeChat(chatId: string): Promise<void> {
		const index = this.chats.findIndex(c => c.id === chatId)
		if (index !== -1) {
			const chat = this.chats[index];

			// Salvo tutte le ROOM sul DB prima di eliminare la CHAT
			for (const roomTourn of chat.rooms) {
				const room = roomTourn.room

				await new Bus(this, this.state.room_repo).dispatch({
					type: typeorm.Actions.SAVE,
					payload: <Partial<RoomRepo>>{
						id: room.id,
						history: room.history || [],
						parentRoomId: room.parentRoomId,
						// Gli agents devono essere già presenti nel DB, salvo solo gli id
						agents: room.agents ?? [],
					}
				})
			}

			this.chats.splice(index, 1);
			this.log(`Chat removed and rooms saved: ${chatId}`);
		} else {
			this.log(`Chat not found: ${chatId}`);
		}
	}

	//#endregion

}

