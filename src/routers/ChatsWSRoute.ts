import { REPO_PATHS } from "@/config.js"
import { IChatContext } from "@/services/rooms/IChatContext.js"
import { ACCOUNT_STATUS, AccountDTO, JWTPayload } from '@/types/account.js'
import { Bus, typeorm, ws } from "@priolo/julian"
import { FindManyOptions } from "typeorm"
import { AgentRepo } from "../repository/Agent.js"
import { RoomRepo } from "../repository/Room.js"
import { TOOL_TYPE, ToolRepo } from "../repository/Tool.js"
import { McpTool } from "../services/mcp/types.js"
import { executeMcpTool, getMcpTools } from "../services/mcp/utils.js"
import ChatNode from "../services/rooms/ChatNode.js"
import RoomTurnBase from "../services/rooms/RoomTurnBase.js"
import { BaseS2C, CHAT_ACTION_C2S, ChatCreateC2S, ChatGetByRoomC2S, RoomAgentsUpdateC2S, RoomHistoryUpdateC2S, UPDATE_TYPE, UserInviteC2S, UserLeaveC2S } from "../types/commons/RoomActions.js"
import AgentRoute from "./AgentRoute.js"
import McpServerRoute from "./McpServerRoute.js"



export type ChatsWSConf = Partial<ChatsWSService['stateDefault']>

/**
 * GLOBAL: WebSocket service for managing prompt chat rooms
 * Contiene le CHAT-ROOMS ognuna di queste composta da piu' ROOMS e CLIENTs
 * in pratica è un servizio di CHAT multi-room e multi-agente 
 * gestisce prevalentemente i messaggi
 */
export class ChatsWSService extends ws.route implements IChatContext {

	/** tuttele CHAT esistenti */
	private chats: ChatNode[] = []

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "ws-chats",
		}
	}
	declare state: typeof this.stateDefault


	//#region OVERWRITING SocketCommunicator

	async onConnect(client: ws.IClient) {
		const userId = client.jwtPayload?.id

		// aggiorno i dati del ACCOUNT
		let account = this.getUserById(userId)
		if (!account) {
			const accountRepo = await new Bus(this, REPO_PATHS.ACCOUNTS).dispatch({
				type: typeorm.Actions.GET_BY_ID,
				payload: userId
			})
			if (!accountRepo) throw new Error(`Account not found: ${userId}`)
			account = AccountDTO(accountRepo)
		}
		client.jwtPayload = {
			...client.jwtPayload,
			...account,
			status: ACCOUNT_STATUS.ONLINE,
		}

		super.onConnect(client)
	}

	async onDisconnect(client: ws.IClient) {
		const userId = client.jwtPayload?.id

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

			case CHAT_ACTION_C2S.USER_LEAVE:
				await this.handleUserLeave(client, msg as UserLeaveC2S)
				break

			case CHAT_ACTION_C2S.USER_INVITE:
				await this.handleUserInvite(client, msg as UserInviteC2S)
				break

			// case CHAT_ACTION_C2S.ROOM_COMPLETE:
			// 	await this.handleRoomComplete(client, msg as RoomCompleteC2S)
			// 	break

			case CHAT_ACTION_C2S.ROOM_AGENTS_UPDATE: {
				const msgUp: RoomAgentsUpdateC2S = msg
				await chat.updateAgents(msgUp.agentsIds, msgUp.roomId)
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
		const accountId = (<JWTPayload>client?.jwtPayload)?.id
		if (!accountId) throw new Error(`Invalid userId`)

		// carico gli agenti REPO
		const agentsRepo = (await Promise.all(
			(msg.agentIds ?? []).map(id => this.getAgentRepoById(id))
		)).filter(agent => !!agent) as AgentRepo[]

		// creo chat e room
		const room = RoomTurnBase.Build(msg.chatId, agentsRepo, accountId)
		const chat = await ChatNode.Build(this, [room], accountId)
		chat.id = msg.chatId

		// inserisco la nuova CHAT e faccio entrare il CLIENT
		this.addChat(chat)
		chat.addUser(accountId)
	}

	/**
	 * Ottiene dalle CHAT esistenti quella che contiene la ROOM specificata
	 * Eventualmente carica i dati dal DB se la ROOM non è in memoria
	 */
	private async handleChatLoadByRoom(client: ws.IClient, msg: ChatGetByRoomC2S) {
		const accountId = client?.jwtPayload?.id
		if (!accountId) throw new Error(`Invalid userId`)

		let chat = this.getChatByRoomId(msg.roomId)

		// non la trovo in memoria quindi carico tutta la CHAT dal DB
		if (!chat) {
			chat = await this.loadChatByRoomId(msg.roomId, accountId)
			this.addChat(chat)
		}

		chat.addUser(accountId)
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

		const isVoid = chat.removeUser(userId)
		if (isVoid) {
			await this.removeChat(chat.id)
			await this.saveChat(chat)
		}
	}

	/**
	 * Un CLIENT lascia una CHAT
	 * Avverte tutti i partecipanti
	 * Se la CHAT è vuota la elimina
	 */
	private async handleUserInvite(client: ws.IClient, msg: UserInviteC2S) {
		const userId = client.jwtPayload?.id
		if (!userId) throw new Error(`Invalid userId`)
		const chat = this.getChatById(msg.chatId)
		if (!chat) throw new Error(`Chat not found: ${msg.chatId}`)
		const invitedUserId = msg.userId
		if (!invitedUserId) throw new Error(`Invalid invited userId`)
		//if ( this.getClientById(invitedUserId) ) return; // già presente

		// inserisco il CLIENT invitato nella CHAT
		chat.addUser(invitedUserId)

	}

	//#endregion 



	//#region ChatContext IMPLEMENTATION 

	static McpCache: Map<string, McpTool[]> = new Map()

	public async getAgentRepoById(agentId: string): Promise<AgentRepo> {

		// [II] non va bene! deve raggiungere il nodo con una path!
		const agent: AgentRepo = await AgentRoute.GetById(agentId, this, REPO_PATHS.AGENTS)

		// [II] --- mettere in una funzione a parte
		// bisogna recuperare la "description" e "parameters" per i TOOLS
		for (const tool of agent.tools ?? []) {

			// se il TOOL ha la description e i parameters non c'e' bisogno di caricarli
			if (!!tool.description && !!tool.parameters) continue

			// se è di tipo MCP allora li cerco in CACHE o li carico
			if (!!tool.mcpId) {

				// non sono in CACHE allora li carico e li metto in CACHE
				if (!ChatsWSService.McpCache.has(tool.mcpId)) {
					// [II] anche questo va ricavato tramite path
					const mcpServer = await McpServerRoute.GetById(tool.mcpId, this)
					if (!mcpServer) continue
					const mcpTools = await getMcpTools(mcpServer.host)
					ChatsWSService.McpCache.set(mcpServer.id, mcpTools)
				}

				// prendo i tools dal CACHE
				const mcpTools = ChatsWSService.McpCache.get(tool.mcpId)
				if (!mcpTools) continue
				const cachedTool = mcpTools.find(t => t.name == tool.name)
				tool.description = cachedTool.description
				tool.parameters = cachedTool.inputSchema
			}
		}
		// [II] --- ---


		return agent
	}

	public async executeTool(toolId: string, args: any): Promise<any> {
		const toolRepo: ToolRepo = await new Bus(this, REPO_PATHS.TOOLS).dispatch({
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
			const mcpServer = await McpServerRoute.GetById(toolRepo.mcpId, this)
			if (!mcpServer) return `MCP Server not found: ${toolRepo.mcpId}`
			return await executeMcpTool(mcpServer.host, toolRepo.name, args)
		}

		return "Tool type not supported"
	}

	public sendMessageToUser(accountId: string, message: BaseS2C) {
		const clients = this.getClientsById(accountId)
		if (clients.length == 0) throw new Error(`Client not found: ${accountId}`)
		for (const client of clients) {
			this.sendToClient(client, JSON.stringify(message))
		}
	}

	/**
	 * Restituisce tutti i CLIENT associati ad un determinato ACCOUNT-ID
	 */
	private getClientsById(accountId: string): ws.IClient[] {
		if (!accountId) return null
		return this.getClients()?.filter(c => c?.jwtPayload?.id == accountId)
	}

	public getUserById(clientId: string): AccountDTO {
		if (!clientId) return null
		return this.getClients()?.find(c => c?.jwtPayload?.id == clientId)?.jwtPayload
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
	 * Inizia una SESSION di una CHAT
	 */
	private addChat(chat: ChatNode): void {
		this.chats.push(chat)
	}

	/**
	 * Termina una SESSION di una CHAT
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
		const roomRepo: RoomRepo = await new Bus(this, REPO_PATHS.ROOMS).dispatch({
			type: typeorm.Actions.GET_BY_ID,
			payload: roomId
		})
		if (!roomRepo || !roomRepo.chatId) throw new Error(`Room not found: ${roomId}`)

		// carico tutte le ROOMs di quella CHAT
		const roomsRepo: RoomRepo[] = await new Bus(this, REPO_PATHS.ROOMS).dispatch({
			type: typeorm.Actions.FIND,
			payload: <FindManyOptions<RoomRepo>>{
				where: {
					chatId: roomRepo.chatId
				}
			}
		})

		// Creo la CHAT con le ROOMs caricate
		const rooms = roomsRepo.map(repo => new RoomTurnBase(repo))
		const chat = await ChatNode.Build(this, rooms, accountId)
		chat.id = roomRepo.chatId
		return chat
	}

	//#endregion



	//#region ROOMS MANAGEMENT

	private async saveRoom(room: RoomRepo): Promise<void> {
		await new Bus(this, REPO_PATHS.ROOMS).dispatch({
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
