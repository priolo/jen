import { Bus, typeorm, ws } from "@priolo/julian"
import { FindManyOptions } from "typeorm"
import { AgentRepo } from "../repository/Agent.js"
import { RoomRepo } from "../repository/Room.js"
import { TOOL_TYPE, ToolRepo } from "../repository/Tool.js"
import { McpTool } from "../services/mcp/types.js"
import { executeMcpTool, getMcpTools } from "../services/mcp/utils.js"
import ChatNode from "../services/rooms/ChatNode.js"
import RoomTurnBased from "../services/rooms/RoomTurnBased.js"
import { BaseS2C, CHAT_ACTION_C2S, ChatCreateC2S, ChatGetByRoomC2S, RoomAgentsUpdateC2S, RoomHistoryUpdateC2S, UPDATE_TYPE, UserEnterC2S, UserLeaveC2S } from "../types/commons/RoomActions.js"
import AgentRoute from "./AgentRoute.js"
import McpServerRoute from "./McpServerRoute.js"
import { TypeLog } from "@priolo/julian/dist/core/types.js"



export type WSRoomsConf = Partial<WSRoomsService['stateDefault']>

/**
 * GLOBAL: WebSocket service for managing prompt chat rooms
 * Contiene le CHAT-ROOMS ognuna di queste composta da piu' ROOMS e CLIENTs
 * in pratica è un servizio di CHAT multi-room e multi-agente 
 * gestisce prevalentemente i messaggi
 */
export class WSRoomsService extends ws.route {

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


	//#region OVERWRITING SocketCommunicator

	async onConnect(client: ws.IClient) {
		// qua posso mettere tutti i dati utili al client
		super.onConnect(client)
	}

	async onDisconnect(client: ws.IClient) {
		// [II] il try va messo nell'oggetto base ws.route
		try {
			// rimuovo il client da tutte le CHATs
			const chats = [...this.chats]
			for (const chat of chats) {
				await this.handleUserLeave(
					client,
					{ action: CHAT_ACTION_C2S.USER_LEAVE, chatId: chat.id } as UserLeaveC2S
				)
			}
			super.onDisconnect(client)
		} catch (error) {
			this.log(`Error onDisconnect: ${error}`, TypeLog.ERROR)
		}
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


		if (msg.action === CHAT_ACTION_C2S.CHAT_CREATE_AND_ENTER) {
			await this.handleChatCreate(client, msg as ChatCreateC2S)
			return
		}
		if (msg.action === CHAT_ACTION_C2S.CHAT_LOAD_BY_ROOM_AND_ENTER) {
			await this.handleChatLoadByRoom(client, msg as ChatGetByRoomC2S)
			return
		}

		// messaggi che necessitano di una CHAT esistente
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
				const room = chat.updateHistory(msgUp.updates, msgUp.roomId)
				if (room.room.agents?.length > 0 && msgUp.updates.some(u => u.content.role == "user" && u.type == UPDATE_TYPE.ADD)) {
					await chat.complete()
				}
				break
			}
		}
	}

	/**
	 * Crea una nuova CHAT.  
	 * crea la MAIN-ROOM
	 * carica gli AGENTs specificati
	 * Inserisce il CLIENT che l'ha creata
	 */
	private async handleChatCreate(client: ws.IClient, msg: ChatCreateC2S) {
		const userId = client?.jwtPayload?.id
		if (!userId) throw new Error(`Invalid userId`)

		// carico gli agenti REPO
		const agentsRepo = (await Promise.all(
			(msg.agentIds ?? []).map(id => this.getAgentRepoById(id))
		)).filter(agent => !!agent) as AgentRepo[]

		// creo chat e room
		const room = ChatNode.BuildRoom(msg.chatId, agentsRepo, userId)
		const chat = await ChatNode.Build(this, [room], userId)
		chat.id = msg.chatId

		// salvo la chat e faccio entrare il client
		this.addChat(chat)
		chat.addClient(userId)
	}

	/**
	 * Ottiene dalle CHAT esistenti quella che contiene la ROOM specificata
	 * Eventualmente carica i dati dal DB se la ROOM non è in memoria
	 */
	private async handleChatLoadByRoom(client: ws.IClient, msg: ChatGetByRoomC2S) {
		const userId = client?.jwtPayload?.id
		if (!userId) throw new Error(`Invalid userId`)

		let chat = this.getChatByRoomId(msg.roomId)

		// non la trovo in memoria quindi carico tutta la CHAT dal DB
		if (!chat) {
			chat = await this.loadChatByRoomId(msg.roomId, userId)
			this.addChat(chat)
		}

		chat.addClient(userId)
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
		chat.addClient(userId)
	}

	/**
	 * Un CLIENT lascia una CHAT
	 * Avverte tutti i partecipanti
	 * Se la CHAT è vuota la elimina
	 */
	private async handleUserLeave(client: ws.IClient, msg: UserLeaveC2S) {
		const userId = client.jwtPayload?.id
		if (!userId) throw new Error(`Invalid userId`)
		const chat = this.getChatById(msg.chatId)
		if (!chat) throw new Error(`Chat not found: ${msg.chatId}`)

		const isVoid = chat.removeClient(userId)
		if (isVoid) {
			await this.removeChat(chat.id)
			await this.saveChat(chat)
		}
	}

	//#endregion 



	//#region ChatContext IMPLEMENTATION 

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
		if (!client) throw new Error(`Client not found: ${clientId}`)
		this.sendToClient(client, JSON.stringify(message))
	}

	//#endregion



	//#region CHATS MANAGEMENT

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
	 * Inserisce una CHAT
	 */
	private addChat(chat: ChatNode): void {
		this.chats.push(chat)
	}

	/**
	 * Rimuove una CHAT
	 */
	private async removeChat(chatId: string): Promise<void> {
		const index = this.chats.findIndex(c => c.id === chatId)
		if (index == -1) throw new Error(`Chat not found: ${chatId}`)
		this.chats.splice(index, 1);
	}

	/** 
	 * Salvo tutte le ROOM di una CHAT sul DB 
	 */
	private async saveChat(chat: ChatNode): Promise<void> {
		if (!chat) return;
		for (const roomChat of chat.rooms) {
			const room = roomChat.room
			await this.saveRoom(room)
		}
	}

	/**
	 * Carica una CHAT dal DB partendo da una ROOM
	 */
	private async loadChatByRoomId(roomId: string, accountId?: string): Promise<ChatNode> {
		// Carico la ROOM richiesta
		const roomRepo: RoomRepo = await new Bus(this, this.state.room_repo).dispatch({
			type: typeorm.Actions.GET_BY_ID,
			payload: roomId
		})
		if (!roomRepo || !roomRepo.chatId) throw new Error(`Room not found: ${roomId}`)

		// carico tutte le ROOMs di quella CHAT
		const roomsRepo: RoomRepo[] = await new Bus(this, this.state.room_repo).dispatch({
			type: typeorm.Actions.FIND,
			payload: <FindManyOptions<RoomRepo>>{ chatId: roomRepo.chatId }
		})

		// Creo la CHAT con le ROOMs caricate
		const rooms = roomsRepo.map(repo => new RoomTurnBased(repo))
		const chat = await ChatNode.Build(this, rooms, accountId)
		chat.id = roomRepo.chatId
		return chat
	}

	//#endregion



	//#region ROOMS MANAGEMENT

	private async saveRoom(room: RoomRepo): Promise<void> {
		await new Bus(this, this.state.room_repo).dispatch({
			type: typeorm.Actions.SAVE,
			payload: <RoomRepo>{
				id: room.id,
				chatId: room.chatId,
				accountId: room.accountId,
				history: room.history ?? [],
				parentRoomId: room.parentRoomId,
				agents: room.agents ?? [],
			}
		})
	}

	//#endregion

}

