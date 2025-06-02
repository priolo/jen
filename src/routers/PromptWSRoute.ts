import { ws } from "@priolo/julian"
import { Prompt, HistoryItem } from "../repository/Prompt.js"
import { getDataSource } from "../repository/dbConfig.js"

export type WSPromptConf = Partial<WSPromptService['stateDefault']>

/**
 * WebSocket service for managing prompt chat rooms
 */
export class WSPromptService extends ws.route {
	// Map to store clients for each prompt room: promptId -> Set<client>
	private promptRooms: Map<string, Set<ws.IClient>> = new Map()
	// Map to store which prompt each client is in: client -> promptId
	private clientPrompts: Map<ws.IClient, string> = new Map()

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "ws-prompt",
			/* nodo da cui ascoltare gli eventi */
			nodeListened: "/",
		}
	}
	async onMessage(client: ws.IClient, message: string) {
		if (!client || !message) return
		const msg = JSON.parse(message) as WSPromptMessage

		switch (msg.action) {
			case PROMPT_ACTIONS.CREATE:
				await this.handleCreatePrompt(client, msg as WSPromptCreateMessage);
				break;
			case PROMPT_ACTIONS.ENTER:
				await this.handleEnterPrompt(client, msg);
				break;	
			case PROMPT_ACTIONS.LEAVE:
				await this.handleLeavePrompt(client, msg);
				break;
			case PROMPT_ACTIONS.ADD_MESSAGE:
				await this.handleAddMessage(client, msg as WSPromptAddMessageMessage);
				break;
			default:
				console.warn(`Unknown action: ${msg.action}`)	
				return;
		}

		console.log(`WSPromptService.onMessage`, msg)
	}

	onDisconnect(client: ws.IClient) {
		// When client disconnects, remove from all rooms
		this.removeClientFromPrompt(client)
		super.onDisconnect(client)
	}

	/**
	 * Handle creating a new prompt
	 */
	private async handleCreatePrompt(client: ws.IClient, msg: WSPromptCreateMessage) {
		try {
			const dataSource = getDataSource()
			const promptRepo = dataSource.getRepository(Prompt)
			
			const prompt = new Prompt()
			prompt.name = msg.name || "Untitled Prompt"
			prompt.history = []
			prompt.agentId = msg.agentId || null
			
			const savedPrompt = await promptRepo.save(prompt)
			
			// Send success response back to creator
			this.sendToClient(client, JSON.stringify({
				action: PROMPT_ACTIONS.CREATE,
				success: true,
				promptId: savedPrompt.id,
				prompt: savedPrompt
			}))
			
		} catch (error) {
			console.error('Error creating prompt:', error)
			this.sendToClient(client, JSON.stringify({
				action: PROMPT_ACTIONS.CREATE,
				success: false,
				error: 'Failed to create prompt'
			}))
		}
	}

	/**
	 * Handle client entering a prompt room
	 */
	private async handleEnterPrompt(client: ws.IClient, msg: WSPromptMessage) {
		try {
			const { id: promptId } = msg
			
			// Remove client from any existing prompt first
			this.removeClientFromPrompt(client)
			
			// Add client to the new prompt room
			if (!this.promptRooms.has(promptId)) {
				this.promptRooms.set(promptId, new Set())
			}
			
			this.promptRooms.get(promptId)!.add(client)
			this.clientPrompts.set(client, promptId)
			
			// Get current prompt data and history
			const dataSource = getDataSource()
			const promptRepo = dataSource.getRepository(Prompt)
			const prompt = await promptRepo.findOne({ where: { id: promptId } })
			
			if (!prompt) {
				this.sendToClient(client, JSON.stringify({
					action: PROMPT_ACTIONS.ENTER,
					success: false,
					error: 'Prompt not found'
				}))
				return
			}
			
			// Send current state to the joining client
			this.sendToClient(client, JSON.stringify({
				action: PROMPT_ACTIONS.ENTER,
				success: true,
				promptId,
				prompt,
				participants: this.promptRooms.get(promptId)!.size
			}))
			
			// Notify other participants that someone joined
			this.broadcastToPrompt(promptId, JSON.stringify({
				action: PROMPT_ACTIONS.USER_JOINED,
				promptId,
				participants: this.promptRooms.get(promptId)!.size
			}), client)
			
		} catch (error) {
			console.error('Error entering prompt:', error)
			this.sendToClient(client, JSON.stringify({
				action: PROMPT_ACTIONS.ENTER,
				success: false,
				error: 'Failed to enter prompt'
			}))
		}
	}

	/**
	 * Handle client leaving a prompt room
	 */
	private async handleLeavePrompt(client: ws.IClient, msg: WSPromptMessage) {
		const promptId = this.clientPrompts.get(client)
		
		if (promptId) {
			this.removeClientFromPrompt(client)
			
			// Notify remaining participants
			this.broadcastToPrompt(promptId, JSON.stringify({
				action: PROMPT_ACTIONS.USER_LEFT,
				promptId,
				participants: this.promptRooms.get(promptId)?.size || 0
			}))
		}
		
		// Send confirmation to the leaving client
		this.sendToClient(client, JSON.stringify({
			action: PROMPT_ACTIONS.LEAVE,
			success: true
		}))
	}

	/**
	 * Handle adding a message to the prompt
	 */
	private async handleAddMessage(client: ws.IClient, msg: WSPromptAddMessageMessage) {
		try {
			const promptId = this.clientPrompts.get(client)
			
			if (!promptId) {
				this.sendToClient(client, JSON.stringify({
					action: PROMPT_ACTIONS.ADD_MESSAGE,
					success: false,
					error: 'Not in any prompt room'
				}))
				return
			}
			
			const { role, text } = msg
			const newMessage: HistoryItem = { role, text }
			
			// Save message to database
			const dataSource = getDataSource()
			const promptRepo = dataSource.getRepository(Prompt)
			const prompt = await promptRepo.findOne({ where: { id: promptId } })
			
			if (!prompt) {
				this.sendToClient(client, JSON.stringify({
					action: PROMPT_ACTIONS.ADD_MESSAGE,
					success: false,
					error: 'Prompt not found'
				}))
				return
			}
			
			// Add message to history
			prompt.history.push(newMessage)
			await promptRepo.save(prompt)
			
			// Broadcast the new message to all participants in the room
			const messageUpdate = {
				action: PROMPT_ACTIONS.MESSAGE_ADDED,
				promptId,
				message: newMessage,
				timestamp: new Date().toISOString()
			}
			
			this.broadcastToPrompt(promptId, JSON.stringify(messageUpdate))
			
		} catch (error) {
			console.error('Error adding message:', error)
			this.sendToClient(client, JSON.stringify({
				action: PROMPT_ACTIONS.ADD_MESSAGE,
				success: false,
				error: 'Failed to add message'
			}))
		}
	}

	/**
	 * Remove client from their current prompt room
	 */
	private removeClientFromPrompt(client: ws.IClient) {
		const promptId = this.clientPrompts.get(client)
		
		if (promptId) {
			const room = this.promptRooms.get(promptId)
			if (room) {
				room.delete(client)
				// If room is empty, remove it
				if (room.size === 0) {
					this.promptRooms.delete(promptId)
				}
			}
			this.clientPrompts.delete(client)
		}
	}

	/**
	 * Broadcast message to all clients in a prompt room
	 */
	private broadcastToPrompt(promptId: string, message: string, excludeClient?: ws.IClient) {
		const room = this.promptRooms.get(promptId)
		
		if (room) {
			room.forEach(client => {
				if (client !== excludeClient) {
					this.sendToClient(client, message)
				}
			})
		}
	}
}

export type WSPromptMessage = {
	id: string
	action: PROMPT_ACTIONS
}

export type WSPromptCreateMessage = WSPromptMessage & {
	action: PROMPT_ACTIONS.CREATE
	name?: string
	agentId?: string
}

export type WSPromptAddMessageMessage = WSPromptMessage & {
	action: PROMPT_ACTIONS.ADD_MESSAGE
	role: "user" | "llm"
	text: string
}

export enum PROMPT_ACTIONS {
	CREATE = "create",
	ENTER = "enter",
	LEAVE = "leave",
	ADD_MESSAGE = "add-message",
	// Response actions sent from server to clients
	MESSAGE_ADDED = "message-added",
	USER_JOINED = "user-joined", 
	USER_LEFT = "user-left",
}
