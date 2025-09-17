import { wsConnection } from "@/plugins/session/wsConnection"
import { deckCardsSo, GetAllCards } from "@/stores/docs/cards"
import { DOC_TYPE } from "@/types"
import { BaseS2C, CHAT_ACTION_C2S, CHAT_ACTION_S2C, ClientEnteredS2C, RoomMessageS2C, RoomNewS2C, ChatCreateC2S, ChatInfoS2C, UserLeaveC2S, UserMessageC2S, RoomAgentsUpdateC2S, RoomHistoryUpdateC2S, UPDATE_TYPE } from "@/types/commons/RoomActions"
import { utils } from "@priolo/jack"
import { createStore, StoreCore } from "@priolo/jon"
import accountSo from "../account/repo"
import { buildRoomDetail } from "../room/factory"
import { Chat, getRoomById } from "./types"



const setup = {

	state: {
		all: <Chat[]>[],
	},

	getters: {
		getChatById(id: string, store?: ChatStore): Chat {
			if (!id) return null
			return store.state.all?.find(chat => chat.id == id) ?? null
		},
		getRoomById(id: string, store?: ChatStore) {
			if (!id) return null
			for (const chat of store.state.all) {
				const room = getRoomById(chat, id)
				if (room) return room
			}
		}
	},

	actions: {

		//#region MESSAGE TO SERVER

		/**
		 * Create and enter in a CHAT
		 */
		createChat: (agentId: string, store?: ChatStore) => {
			const msgSend: ChatCreateC2S = {
				action: CHAT_ACTION_C2S.CHAT_CREATE,
				agentIds: agentId ? [agentId] : [],
			}
			wsConnection.send(JSON.stringify(msgSend))
		},

		/**
		 * Update the list of AGENTS in a ROOM 
		 */
		updateAgentsInRoom: (
			{ chatId, roomId, agentsIds }: { chatId: string, roomId: string, agentsIds: string[] },
			store?: ChatStore
		) => {
			const message: RoomAgentsUpdateC2S = {
				action: CHAT_ACTION_C2S.ROOM_AGENTS_UPDATE,
				chatId: chatId,
				roomId: roomId,
				agentsIds: agentsIds,
			}
			wsConnection.send(JSON.stringify(message))
		},
		/**
		 * Add AGENTs to a ROOM
		 */
		addAgentsToRoom: (
			{ chatId, roomId, agentsIds }: { chatId: string, roomId: string, agentsIds: string[] },
			store?: ChatStore
		) => {
			const room = store.getRoomById(roomId)
			if (!room) return
			const newAgentsIds = [... new Set([...room.agentsIds, ...agentsIds])]
			store.updateAgentsInRoom({ chatId, roomId, agentsIds: newAgentsIds })
		},
		/**
		 * Add a MESSAGE in the HISTORY of a ROOM
		 */
		addMessageToRoom: (
			{ chatId, roomId, text }: { chatId: string, roomId: string, text: string },
			store?: ChatStore
		) => {
			const room = store.getRoomById(roomId)
			if (!room) return
			const lastMessage = room.history[room.history.length - 1]
			const message: RoomHistoryUpdateC2S = {
				action: CHAT_ACTION_C2S.ROOM_HISTORY_UPDATE,
				chatId: chatId,
				roomId: roomId,
				updates: [{
					refId: lastMessage?.id,
					type: UPDATE_TYPE.ADD,
					content: { role: "user", content: text }
				}],
			}
			wsConnection.send(JSON.stringify(message))
		},
		/** 
		 * Questo USER lascia una CHAT
		*/
		removeChat: async (chatId: string, store?: ChatStore) => {
			const message: UserLeaveC2S = {
				action: CHAT_ACTION_C2S.USER_LEAVE,
				chatId: chatId,
			}
			wsConnection.send(JSON.stringify(message))
		},

		//#endregion

		/**
		 * HANDLE MESSAGE FROM SERVER
		 */
		onMessage: (data: any, store?: ChatStore) => {
			const message: BaseS2C = JSON.parse(data.payload)

			switch (message.action) {

				/**
				 * fornsce le info di una CHAT
				 * tipicamente risposnta di CHAT_CREATE
				 */
				case CHAT_ACTION_S2C.CHAT_INFO: {
					const msg: ChatInfoS2C = JSON.parse(data.payload)
					let chat = {
						id: msg.chatId,
						clientsIds: msg.clientsIds,
						rooms: msg.rooms,
					}
					const chatOld = store.getChatById(msg.chatId)
					if (!!chatOld) {
						chat = { ...chatOld, ...chat }
						store.setAll([...store.state.all])
					} else {
						store.setAll([...store.state.all, chat])
					}

					// creo e apro una CARD per la gestione della ROOM
					const view = buildRoomDetail({
						chatId: chat.id,
						roomId: chat.rooms[0]?.id,
					})
					deckCardsSo.add({ view, anim: true })

					break
				}

				case CHAT_ACTION_S2C.CLIENT_ENTERED: {
					const msg = message as ClientEnteredS2C
					//*** */
					break
				}

				case CHAT_ACTION_S2C.CLIENT_LEAVE: {
					const msg = message as RoomMessageS2C
					//*** */
					break
				}

				case CHAT_ACTION_S2C.ROOM_MESSAGE: {
					const msg: RoomMessageS2C = message as RoomMessageS2C
					const room = store.getRoomById(msg.roomId)
					room?.history.push(msg.content)
					store._update()
					break
				}

				case CHAT_ACTION_S2C.ROOM_NEW: {
					const msg = message as RoomNewS2C
					const chat = store.getChatById(msg.chatId)
					chat.rooms.push({
						id: msg.roomId,
						parentRoomId: msg.parentRoomId,
						agentsIds: msg.agentsIds,
						history: [],
					})
					store._update()

					const view = buildRoomDetail({
						chatId: msg.chatId,
						roomId: msg.roomId,
					})
					const roomStore = utils.findAll(GetAllCards(), {
						type: DOC_TYPE.ROOM_DETAIL,
						roomId: msg.parentRoomId,
					})?.[0]
					roomStore.state.group.addLink({ view, parent: roomStore, anim: true })
					break
				}

			}

		}

	},

	mutators: {
		setAll: (all: Chat[]) => ({ all }),
	},
}

export type ChatState = typeof setup.state
export type ChatGetters = typeof setup.getters
export type ChatActions = typeof setup.actions
export type ChatMutators = typeof setup.mutators
export interface ChatStore extends StoreCore<ChatState>, ChatGetters, ChatActions, ChatMutators {
	state: ChatState
}

const chatSo = createStore<ChatState>(setup) as ChatStore
export default chatSo;



wsConnection.emitter.on("message", chatSo.onMessage)