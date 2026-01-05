import { wsConnection } from "@/plugins/session/wsConnection"
import { SS_EVENT } from "@/plugins/SocketService/types"
import { GetAllCards } from "@/stores/docs/cards"
import { DOC_TYPE } from "@/types"
import { BaseS2C, CHAT_ACTION_C2S, CHAT_ACTION_S2C, ChatCreateC2S, ChatGetByRoomC2S, ChatInfoS2C, ChatRoom, ClientEnteredS2C, ClientLeaveS2C, RoomAgentsUpdateC2S, RoomHistoryUpdateC2S, RoomHistoryUpdateS2C, RoomNewS2C, UPDATE_TYPE, UserLeaveC2S } from "@/types/commons/RoomActions"
import { utils } from "@priolo/jack"
import { createStore, StoreCore } from "@priolo/jon"
import { buildRoomDetail } from "../room/factory"
import { Chat } from "./types"



const setup = {

	state: {
		/** è praticamente un proxy delle CHAT presenti sul server */
		all: <Chat[]>[],

		online: <boolean>false,
	},

	getters: {
		getChatById(id: string, store?: ChatStore): Chat {
			if (!id) return null
			return store.state.all?.find(chat => chat.id == id) ?? null
		},
		getRoomById(id: string, store?: ChatStore) {
			if (!id) return null
			for (const chat of store.state.all) {
				const room = chat.rooms?.find(r => r.id == id) ?? null
				if (room) return room
			}
		}
	},

	actions: {

		//#region MESSAGE TO SERVER

		/**
		 * Create and enter in a CHAT
		 * response CHAT_INFO
		 */
		createChat: async (
			props: { chatId: string, agentIds: string[] },
			store?: ChatStore
		) => {
			const { chatId, agentIds } = props
			const msgSend: ChatCreateC2S = {
				chatId: chatId,
				action: CHAT_ACTION_C2S.CHAT_CREATE,
				agentIds,
			}
			wsConnection.send(JSON.stringify(msgSend))

			// const responseStr = await wsConnection.sendAndWait(
			// 	JSON.stringify(msgSend),
			// 	data => {
			// 		if ( !data ) return false
			// 		const msg = JSON.parse(data) as ChatInfoS2C
			// 		return msg.action == CHAT_ACTION_S2C.CHAT_INFO && msg.chatId == chatId
			// 	}
			// )
			// const msg: ChatInfoS2C = JSON.parse(responseStr)
		},

		/** 
		 * recupera i dati di una CHAT tramite l'id di una ROOM 
		 */
		fetchChatByRoomId: (roomId: string, store?: ChatStore) => {
			// se non c'e' in locale la chiedo al server
			const room = chatSo.getRoomById(roomId)
			if (room) return
			const msgSend: ChatGetByRoomC2S = {
				action: CHAT_ACTION_C2S.CHAT_GET_BY_ROOM,
				roomId: roomId,
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
		// addAgentsToRoom: (
		// 	{ chatId, roomId, agentsIds }: { chatId: string, roomId: string, agentsIds: string[] },
		// 	store?: ChatStore
		// ) => {
		// 	const room = store.getRoomById(roomId)
		// 	if (!room) return
		// 	const newAgentsIds = [... new Set([...room.agentsIds, ...agentsIds])]
		// 	store.updateAgentsInRoom({ chatId, roomId, agentsIds: newAgentsIds })
		// },
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
				 * arrivate le INFO di una CHAT
				 * le integro nella store
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
					break
				}


				case CHAT_ACTION_S2C.CLIENT_ENTERED: {
					const msg = message as ClientEnteredS2C
					//*** */
					break
				}

				case CHAT_ACTION_S2C.CLIENT_LEAVE: {
					const msg = message as ClientLeaveS2C
					//*** */
					break
				}

				case CHAT_ACTION_S2C.ROOM_HISTORY_UPDATE: {
					const msg: RoomHistoryUpdateS2C = message as RoomHistoryUpdateS2C
					const room = store.getRoomById(msg.roomId)
					if (!room) break

					const history = [...room.history]
					for (const update of msg.updates) {
						const index = history.findIndex(m => m.id == update.refId)
						switch (update.type) {
							case UPDATE_TYPE.ADD: {
								if (index == -1) {
									history.unshift(update.content)
								} else {
									history.splice(index + 1, 0, update.content)
								}
								break
							}
							case UPDATE_TYPE.DELETE: {
								if (index != -1) history.splice(index, 1)
								break
							}
							case UPDATE_TYPE.REPLACE: {
								if (index != -1) history[index] = update.content
								break
							}
						}
					}
					room.history = history
					store._update()
					break
				}

				/** [II] DA ELIMINARE */
				// case CHAT_ACTION_S2C.ROOM_MESSAGE: {
				// 	const msg: RoomMessageS2C = message as RoomMessageS2C
				// 	const room = store.getRoomById(msg.roomId)
				// 	room?.history.push(msg.content)
				// 	store._update()
				// 	break
				// }

				case CHAT_ACTION_S2C.ROOM_NEW: {
					const msg = message as RoomNewS2C
					const chat = store.getChatById(msg.chatId)
					chat.rooms.push({
						id: msg.roomId,
						chatId: msg.chatId,
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
		setOnline: (online: boolean) => ({ online }),
	},
}

export type ChatState = typeof setup.state
export type ChatGetters = typeof setup.getters
export type ChatActions = typeof setup.actions
export type ChatMutators = typeof setup.mutators

/**
 * Si occupa di mentenere i dati delle CHAT sul client comunicando con il server via WEBSOCKET
 */
export interface ChatStore extends StoreCore<ChatState>, ChatGetters, ChatActions, ChatMutators {
	state: ChatState
}

const chatSo = createStore<ChatState>(setup) as ChatStore
export default chatSo;


wsConnection.emitter.on(SS_EVENT.MESSAGE, chatSo.onMessage)
wsConnection.emitter.on(SS_EVENT.CONNECTION,
	({ payload }: { payload: number }) => chatSo.setOnline(payload == WebSocket.OPEN)
)


export function getMainRoom(rooms: ChatRoom[]): ChatRoom {
	if (rooms == null) return null
	for (const room of rooms) {
		if (!room.parentRoomId) return room
	}
	return null
}